import { hasPermission, canManageUsers, canModifyVMs, canDeleteVMs } from "@/lib/rbac";
import { Role } from "@prisma/client";

describe("RBAC", () => {
  it("grants admin full permissions", () => {
    expect(hasPermission(Role.ADMIN, "vm:delete")).toBe(true);
    expect(hasPermission(Role.ADMIN, "user:create")).toBe(true);
    expect(hasPermission(Role.ADMIN, "audit:read")).toBe(true);
    expect(canManageUsers(Role.ADMIN)).toBe(true);
    expect(canDeleteVMs(Role.ADMIN)).toBe(true);
  });

  it("restricts operator permissions", () => {
    expect(hasPermission(Role.OPERATOR, "vm:create")).toBe(true);
    expect(hasPermission(Role.OPERATOR, "hardware:create")).toBe(true);
    expect(hasPermission(Role.OPERATOR, "vm:delete")).toBe(false);
    expect(hasPermission(Role.OPERATOR, "hardware:delete")).toBe(false);
    expect(hasPermission(Role.OPERATOR, "user:create")).toBe(false);
    expect(canModifyVMs(Role.OPERATOR)).toBe(true);
    expect(canManageUsers(Role.OPERATOR)).toBe(false);
  });

  it("restricts viewer to read-only", () => {
    expect(hasPermission(Role.VIEWER, "vm:read")).toBe(true);
    expect(hasPermission(Role.VIEWER, "hardware:read")).toBe(true);
    expect(hasPermission(Role.VIEWER, "vm:create")).toBe(false);
    expect(hasPermission(Role.VIEWER, "hardware:create")).toBe(false);
    expect(hasPermission(Role.VIEWER, "vm:update")).toBe(false);
    expect(hasPermission(Role.VIEWER, "report:export")).toBe(true);
    expect(canModifyVMs(Role.VIEWER)).toBe(false);
  });
});
