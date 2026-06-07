import { vmSchema, loginSchema, resolveLoginEmail } from "@/lib/validations";

describe("Validations", () => {
  it("validates login input", () => {
    const result = loginSchema.safeParse({ username: "zamir.amiri", password: "test" });
    expect(result.success).toBe(true);
  });

  it("resolves username to email", () => {
    expect(resolveLoginEmail("zamir.amiri")).toBe("zamir.amiri@ahg.local");
    expect(resolveLoginEmail("admin@test.com")).toBe("admin@test.com");
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "test" });
    expect(result.success).toBe(false);
  });

  it("validates VM input", () => {
    const result = vmSchema.safeParse({
      hostname: "vm-001.corp.local",
      vmName: "web-server-01",
      environment: "PRODUCTION",
      platform: "PROXMOX",
      cpuCores: 4,
      memoryGB: 16,
      storageGB: 100,
      criticality: "HIGH",
      status: "ACTIVE",
      powerState: "ON",
      backupEnabled: true,
      monitoringEnabled: true,
      haEnabled: false,
      antivirusInstalled: true,
      cisStigHardening: false,
      encryptionAtRest: true,
      tags: ["prod", "web"],
      complianceTags: ["PCI"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid IP address", () => {
    const result = vmSchema.safeParse({
      hostname: "vm-001.corp.local",
      vmName: "web-server-01",
      environment: "PRODUCTION",
      platform: "OPENSTACK",
      ipAddress: "not-an-ip",
      cpuCores: 4,
      memoryGB: 16,
      storageGB: 100,
      criticality: "HIGH",
      status: "ACTIVE",
      powerState: "ON",
      backupEnabled: false,
      monitoringEnabled: false,
      haEnabled: false,
      antivirusInstalled: false,
      cisStigHardening: false,
      encryptionAtRest: false,
      tags: [],
      complianceTags: [],
    });
    expect(result.success).toBe(false);
  });
});
