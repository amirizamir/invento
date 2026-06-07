import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import { ApiError } from "@/lib/api-utils";
import { Role } from "@prisma/client";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new ApiError(401, "Unauthorized");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, permission)) {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}
