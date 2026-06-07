import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("report:read");
    const type = request.nextUrl.searchParams.get("type") || "infrastructure";

    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    if (type === "infrastructure") {
      const [platforms, resources, utilization] = await Promise.all([
        prisma.virtualMachine.groupBy({ by: ["platform"], _count: { id: true } }),
        prisma.virtualMachine.aggregate({
          _sum: { cpuCores: true, memoryGB: true, storageGB: true },
          _count: { id: true },
        }),
        prisma.virtualMachine.groupBy({
          by: ["environment"],
          _sum: { cpuCores: true, memoryGB: true, storageGB: true },
          _count: { id: true },
        }),
      ]);

      return apiSuccess({
        type: "infrastructure",
        platformDistribution: platforms,
        capacity: resources,
        utilization,
      });
    }

    if (type === "security") {
      const [missingBackups, missingMonitoring, stalePatches] = await Promise.all([
        prisma.virtualMachine.findMany({
          where: { backupEnabled: false, status: { not: "DECOMMISSIONED" } },
          select: { id: true, hostname: true, vmName: true, department: true, criticality: true },
        }),
        prisma.virtualMachine.findMany({
          where: { monitoringEnabled: false, status: { not: "DECOMMISSIONED" } },
          select: { id: true, hostname: true, vmName: true, department: true, criticality: true },
        }),
        prisma.virtualMachine.findMany({
          where: {
            OR: [{ lastPatchDate: null }, { lastPatchDate: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } }],
            status: "ACTIVE",
          },
          select: { id: true, hostname: true, vmName: true, lastPatchDate: true, patchGroup: true },
        }),
      ]);

      return apiSuccess({ type: "security", missingBackups, missingMonitoring, stalePatches });
    }

    if (type === "lifecycle") {
      const [eolSystems, inactiveSystems, decommissionCandidates] = await Promise.all([
        prisma.virtualMachine.findMany({
          where: { endOfLifeDate: { lte: ninetyDaysFromNow }, status: { not: "DECOMMISSIONED" } },
        }),
        prisma.virtualMachine.findMany({ where: { status: "INACTIVE" } }),
        prisma.virtualMachine.findMany({
          where: {
            status: "INACTIVE",
            powerState: "OFF",
            updatedDate: { lt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      return apiSuccess({ type: "lifecycle", eolSystems, inactiveSystems, decommissionCandidates });
    }

    if (type === "business") {
      const [departments, applications, costCenters] = await Promise.all([
        prisma.virtualMachine.groupBy({
          by: ["department"],
          _count: { id: true },
          _sum: { cpuCores: true, memoryGB: true, storageGB: true },
          where: { department: { not: null } },
        }),
        prisma.virtualMachine.groupBy({
          by: ["application"],
          _count: { id: true },
          where: { application: { not: null } },
        }),
        prisma.virtualMachine.groupBy({
          by: ["costCenter"],
          _count: { id: true },
          _sum: { cpuCores: true, memoryGB: true, storageGB: true },
          where: { costCenter: { not: null } },
        }),
      ]);

      return apiSuccess({ type: "business", departments, applications, costCenters });
    }

    return apiSuccess({ type, message: "Unknown report type" });
  } catch (error) {
    return handleApiError(error);
  }
}
