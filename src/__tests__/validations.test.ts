import { vmSchema, loginSchema } from "@/lib/validations";

describe("Validations", () => {
  it("validates login input", () => {
    const result = loginSchema.safeParse({ email: "admin@test.com", password: "test" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "invalid", password: "test" });
    expect(result.success).toBe(false);
  });

  it("validates VM input", () => {
    const result = vmSchema.safeParse({
      hostname: "vm-001.corp.local",
      vmName: "web-server-01",
      environment: "PRODUCTION",
      platform: "VMWARE",
      cpuCores: 4,
      memoryGB: 16,
      storageGB: 100,
      criticality: "HIGH",
      status: "ACTIVE",
      powerState: "ON",
      backupEnabled: true,
      monitoringEnabled: true,
      tags: ["prod", "web"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid IP address", () => {
    const result = vmSchema.safeParse({
      hostname: "vm-001.corp.local",
      vmName: "web-server-01",
      environment: "PRODUCTION",
      platform: "VMWARE",
      ipAddress: "not-an-ip",
      cpuCores: 4,
      memoryGB: 16,
      storageGB: 100,
      criticality: "HIGH",
      status: "ACTIVE",
      powerState: "ON",
      backupEnabled: false,
      monitoringEnabled: false,
      tags: [],
    });
    expect(result.success).toBe(false);
  });
});
