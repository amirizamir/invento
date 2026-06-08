import { Role } from "@prisma/client";

export type Permission =
  | "vm:read"
  | "vm:create"
  | "vm:update"
  | "vm:delete"
  | "vm:import"
  | "vm:export"
  | "hardware:read"
  | "hardware:create"
  | "hardware:update"
  | "hardware:delete"
  | "hardware:export"
  | "report:read"
  | "report:export"
  | "user:read"
  | "user:create"
  | "user:update"
  | "user:delete"
  | "audit:read"
  | "integration:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "vm:read",
    "vm:create",
    "vm:update",
    "vm:delete",
    "vm:import",
    "vm:export",
    "hardware:read",
    "hardware:create",
    "hardware:update",
    "hardware:delete",
    "hardware:export",
    "report:read",
    "report:export",
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "audit:read",
    "integration:manage",
    "settings:manage",
  ],
  OPERATOR: [
    "vm:read",
    "vm:create",
    "vm:update",
    "vm:import",
    "vm:export",
    "hardware:read",
    "hardware:create",
    "hardware:update",
    "hardware:export",
    "report:read",
    "report:export",
  ],
  VIEWER: [
    "vm:read",
    "vm:export",
    "hardware:read",
    "hardware:export",
    "report:read",
    "report:export",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "user:create");
}

export function canModifyVMs(role: Role): boolean {
  return hasPermission(role, "vm:update");
}

export function canDeleteVMs(role: Role): boolean {
  return hasPermission(role, "vm:delete");
}

export function canModifyHardware(role: Role): boolean {
  return hasPermission(role, "hardware:update");
}

export function canDeleteHardware(role: Role): boolean {
  return hasPermission(role, "hardware:delete");
}

export function canViewAuditLogs(role: Role): boolean {
  return hasPermission(role, "audit:read");
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
  VIEWER: "Viewer",
};
