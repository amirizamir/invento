import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { hardwareSchema } from "@/lib/hardware-validations";
import { toHardwareUpdateData } from "@/lib/hardware-data";
import { logHardwareUpdate, logHardwareDelete } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission("hardware:read");
    const { id } = await params;

    const hardware = await prisma.hardwareEquipment.findUnique({ where: { id } });
    if (!hardware) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Hardware equipment not found");
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: "HardwareEquipment", entityId: id },
      orderBy: { timestamp: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return apiSuccess({ hardware, auditLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("hardware:update");
    const { id } = await params;
    const body = await request.json();
    const data = hardwareSchema.parse(body);

    const existing = await prisma.hardwareEquipment.findUnique({ where: { id } });
    if (!existing) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Hardware equipment not found");
    }

    const hardware = await prisma.hardwareEquipment.update({
      where: { id },
      data: toHardwareUpdateData(data),
    });

    await logHardwareUpdate(session.user.id, id, existing, hardware);

    return apiSuccess(hardware);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("hardware:delete");
    const { id } = await params;

    const existing = await prisma.hardwareEquipment.findUnique({ where: { id } });
    if (!existing) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Hardware equipment not found");
    }

    await prisma.hardwareEquipment.delete({ where: { id } });
    await logHardwareDelete(session.user.id, id, existing);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
