import type { VMInput } from "@/lib/validations";
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

export function toVMCreateData(data: Partial<VMInput>, createdBy?: string) {
  const merged = { ...VM_CREATE_DEFAULTS, ...data };

  return {
    ...merged,
    ipAddress: merged.ipAddress || null,
    createdBy: createdBy ?? merged.createdBy ?? null,
  };
}

export function toVMUpdateData(data: VMInput) {
  return {
    ...data,
    ipAddress: data.ipAddress || null,
  };
}
