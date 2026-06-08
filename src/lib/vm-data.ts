import type { VMInput } from "@/lib/validations";
import { isAgentActive } from "@/lib/validations";
import {
  Criticality,
  Environment,
  Platform,
  PowerState,
  VMStatus,
} from "@prisma/client";

const VM_CREATE_DEFAULTS = {
  environment: Environment.DEV,
  platform: Platform.OTHER,
  cpuCores: 1,
  memoryGB: 4,
  storageGB: 50,
  criticality: Criticality.MEDIUM,
  status: VMStatus.PENDING,
  powerState: PowerState.OFF,
  backupEnabled: false,
  monitoringEnabled: false,
  haEnabled: false,
  antivirusInstalled: false,
  cisStigHardening: false,
  encryptionAtRest: false,
  tags: [] as string[],
  complianceTags: [] as string[],
};

function normalizeVmFields(data: Partial<VMInput>) {
  const merged = { ...VM_CREATE_DEFAULTS, ...data };

  return {
    ...merged,
    hostname: merged.hostname?.trim() || merged.vmName?.trim() || "—",
    ipAddress: merged.ipAddress || null,
    sshPort: merged.sshPort ?? null,
    rdpPort: merged.rdpPort ?? null,
    cpuCores: merged.cpuCores ?? 1,
    memoryGB: merged.memoryGB ?? 4,
    storageGB: merged.storageGB ?? 50,
    tags: merged.tags ?? [],
    complianceTags: merged.complianceTags ?? [],
    antivirusAgent: merged.antivirusAgent?.trim() || null,
    siemAgent: merged.siemAgent?.trim() || null,
    monitoringStack: merged.monitoringStack?.trim() || null,
    antivirusInstalled: isAgentActive(merged.antivirusAgent) || merged.antivirusInstalled === true,
    monitoringEnabled: isAgentActive(merged.monitoringStack) || merged.monitoringEnabled === true,
    haEnabled: merged.haEnabled ?? false,
    backupEnabled: merged.backupEnabled ?? false,
    cisStigHardening: merged.cisStigHardening ?? false,
    encryptionAtRest: merged.encryptionAtRest ?? false,
  };
}

export function toVMCreateData(data: Partial<VMInput>, createdBy?: string) {
  const normalized = normalizeVmFields(data);

  return {
    ...normalized,
    createdBy: createdBy ?? normalized.createdBy ?? null,
  };
}

export function toVMUpdateData(data: VMInput) {
  return normalizeVmFields(data);
}
