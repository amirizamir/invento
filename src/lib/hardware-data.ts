import type { HardwareInput } from "@/lib/hardware-validations";
import {
  Criticality,
  Environment,
  HardwareCategory,
  HardwareManufacturer,
  PowerState,
  VMStatus,
} from "@prisma/client";

const HARDWARE_CREATE_DEFAULTS = {
  category: HardwareCategory.OTHER,
  manufacturer: HardwareManufacturer.OTHER,
  status: VMStatus.PENDING,
  powerState: PowerState.OFF,
  criticality: Criticality.MEDIUM,
  environment: Environment.PRODUCTION,
  monitoringEnabled: false,
  encryptionCapable: false,
  tags: [] as string[],
  complianceTags: [] as string[],
};

export function toHardwareCreateData(data: Partial<HardwareInput>, createdBy?: string) {
  const merged = { ...HARDWARE_CREATE_DEFAULTS, ...data };

  return {
    ...merged,
    managementIp: merged.managementIp || null,
    createdBy: createdBy ?? merged.createdBy ?? null,
  };
}

export function toHardwareUpdateData(data: HardwareInput) {
  return {
    ...data,
    managementIp: data.managementIp || null,
  };
}
