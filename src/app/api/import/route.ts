import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Papa from "papaparse";
import {
  apiSuccess,
  handleApiError,
  parsePagination,
  paginationMeta,
} from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { importRowSchema } from "@/lib/validations";
import { logImport } from "@/lib/audit";
import {
  Criticality,
  Environment,
  Platform,
  PowerState,
  VMStatus,
} from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("vm:import");
    const { page, pageSize, skip } = parsePagination(request.nextUrl.searchParams);

    const [imports, total] = await Promise.all([
      prisma.importJob.findMany({
        skip,
        take: pageSize,
        orderBy: { startedAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.importJob.count(),
    ]);

    return apiSuccess({ imports, pagination: paginationMeta(total, page, pageSize) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("vm:import");
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(400, "File is required");
    }

    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    const importJob = await prisma.importJob.create({
      data: {
        fileName: file.name,
        status: "PROCESSING",
        totalRecords: parsed.data.length,
        userId: session.user.id,
      },
    });

    const rowErrors: Array<{ row: number; error: string }> = [];
    let successful = 0;

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      try {
        const normalized = normalizeImportRow(row);
        const data = importRowSchema.parse(normalized);

        const existing = await prisma.virtualMachine.findFirst({
          where: { OR: [{ hostname: data.hostname }, { vmName: data.vmName }] },
        });

        if (existing) {
          rowErrors.push({ row: i + 2, error: `Duplicate: ${data.hostname} / ${data.vmName}` });
          continue;
        }

        await prisma.virtualMachine.create({
          data: {
            hostname: data.hostname,
            vmName: data.vmName,
            description: data.description,
            environment: (data.environment as Environment) || Environment.DEV,
            platform: (data.platform as Platform) || Platform.OTHER,
            ipAddress: data.ipAddress || null,
            secondaryIp: data.secondaryIp,
            osType: data.osType,
            osVersion: data.osVersion,
            cpuCores: data.cpuCores ?? 1,
            memoryGB: data.memoryGB ?? 4,
            storageGB: data.storageGB ?? 50,
            owner: data.owner,
            department: data.department,
            businessUnit: data.businessUnit,
            application: data.application,
            criticality: (data.criticality as Criticality) || Criticality.MEDIUM,
            status: (data.status as VMStatus) || VMStatus.PENDING,
            powerState: (data.powerState as PowerState) || PowerState.OFF,
            backupEnabled: data.backupEnabled ?? false,
            monitoringEnabled: data.monitoringEnabled ?? false,
            patchGroup: data.patchGroup,
            location: data.location,
            datacenter: data.datacenter,
            cluster: data.cluster,
            resourcePool: data.resourcePool,
            costCenter: data.costCenter,
            tags: data.tags ?? [],
            notes: data.notes,
            lastPatchDate: data.lastPatchDate,
            endOfLifeDate: data.endOfLifeDate,
          },
        });
        successful++;
      } catch (err) {
        rowErrors.push({
          row: i + 2,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const completed = await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: rowErrors.length === parsed.data.length ? "FAILED" : "COMPLETED",
        successfulRecords: successful,
        failedRecords: rowErrors.length,
        errors: rowErrors.length > 0 ? (rowErrors as Prisma.InputJsonValue) : undefined,
        completedAt: new Date(),
      },
    });

    await logImport(session.user.id, importJob.id, {
      fileName: file.name,
      total: parsed.data.length,
      successful,
      failed: rowErrors.length,
    });

    return apiSuccess(completed, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

function normalizeImportRow(row: Record<string, string>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const k = key.trim();
    const v = value?.trim();
    if (!v) continue;

    if (["cpuCores", "memoryGB", "storageGB"].includes(k)) {
      result[k] = parseInt(v, 10);
    } else if (["backupEnabled", "monitoringEnabled"].includes(k)) {
      result[k] = v.toLowerCase() === "true" || v === "1" || v.toLowerCase() === "yes";
    } else if (k === "tags") {
      result[k] = v.split(";").map((t) => t.trim()).filter(Boolean);
    } else if (["lastPatchDate", "endOfLifeDate"].includes(k)) {
      result[k] = new Date(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}
