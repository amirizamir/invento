import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { apiSuccess, handleApiError, ApiError } from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { userUpdateSchema } from "@/lib/validations";
import { logUserAction } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("user:update");
    const { id } = await params;
    const body = await request.json();
    const data = userUpdateSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "User not found");

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.role) updateData.role = data.role;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password && data.password.length > 0) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await logUserAction("UPDATE", session.user.id, id, existing, user);

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("user:delete");
    const { id } = await params;

    if (session.user.id === id) {
      throw new ApiError(400, "Cannot delete your own account");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "User not found");

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await logUserAction("DISABLE", session.user.id, id, existing, { isActive: false });

    return apiSuccess({ disabled: true });
  } catch (error) {
    return handleApiError(error);
  }
}
