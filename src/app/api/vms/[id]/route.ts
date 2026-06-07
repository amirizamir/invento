import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { vmSchema } from "@/lib/validations";
import { toVMUpdateData } from "@/lib/vm-data";
import { logVMUpdate, logVMDelete } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission("vm:read");
    const { id } = await params;

    const vm = await prisma.virtualMachine.findUnique({ where: { id } });
    if (!vm) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Virtual machine not found");
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: "VirtualMachine", entityId: id },
      orderBy: { timestamp: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return apiSuccess({ vm, auditLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("vm:update");
    const { id } = await params;
    const body = await request.json();
    const data = vmSchema.parse(body);

    const existing = await prisma.virtualMachine.findUnique({ where: { id } });
    if (!existing) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Virtual machine not found");
    }

    const vm = await prisma.virtualMachine.update({
      where: { id },
      data: toVMUpdateData(data),
    });

    await logVMUpdate(session.user.id, id, existing, vm);

    return apiSuccess(vm);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("vm:delete");
    const { id } = await params;

    const existing = await prisma.virtualMachine.findUnique({ where: { id } });
    if (!existing) {
      const { ApiError } = await import("@/lib/api-utils");
      throw new ApiError(404, "Virtual machine not found");
    }

    await prisma.virtualMachine.delete({ where: { id } });
    await logVMDelete(session.user.id, id, existing);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
