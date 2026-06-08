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

  it("validates minimal VM input (only name required)", () => {
    const result = vmSchema.safeParse({ vmName: "web-server-01" });
    expect(result.success).toBe(true);
  });

  it("allows optional SSH and RDP ports", () => {
    const result = vmSchema.safeParse({
      vmName: "web-server-01",
      sshPort: "",
      rdpPort: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts Proxmox disk types and security stack fields", () => {
    const result = vmSchema.safeParse({
      vmName: "proxmox-vm-01",
      diskType: "qcow2",
      antivirusAgent: "ClamAV (Linux)",
      siemAgent: "Wazuh",
      monitoringStack: "Prometheus/Grafana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid IP address", () => {
    const result = vmSchema.safeParse({
      vmName: "web-server-01",
      ipAddress: "not-an-ip",
    });
    expect(result.success).toBe(false);
  });
});
