import type { VMInput } from "@/lib/validations";

type VMRecord = {
  hostname: string;
  vmName: string;
  description?: string | null;
  environment: VMInput["environment"];
  platform: VMInput["platform"];
  ipAddress?: string | null;
  secondaryIp?: string | null;
  osType?: string | null;
  osVersion?: string | null;
  cpuCores: number;
  memoryGB: number;
  storageGB: number;
  owner?: string | null;
  department?: string | null;
  businessUnit?: string | null;
  application?: string | null;
  criticality: VMInput["criticality"];
  status: VMInput["status"];
  powerState: VMInput["powerState"];
  backupEnabled: boolean;
  monitoringEnabled: boolean;
  patchGroup?: string | null;
  location?: string | null;
  datacenter?: string | null;
  cluster?: string | null;
  resourcePool?: string | null;
  costCenter?: string | null;
  tags: string[];
  notes?: string | null;
  lastPatchDate?: string | Date | null;
  endOfLifeDate?: string | Date | null;
};

export function toVMFormValues(vm: VMRecord): VMInput {
  return {
    hostname: vm.hostname,
    vmName: vm.vmName,
    description: vm.description ?? undefined,
    environment: vm.environment,
    platform: vm.platform,
    ipAddress: vm.ipAddress ?? "",
    secondaryIp: vm.secondaryIp ?? undefined,
    osType: vm.osType ?? undefined,
    osVersion: vm.osVersion ?? undefined,
    cpuCores: vm.cpuCores,
    memoryGB: vm.memoryGB,
    storageGB: vm.storageGB,
    owner: vm.owner ?? undefined,
    department: vm.department ?? undefined,
    businessUnit: vm.businessUnit ?? undefined,
    application: vm.application ?? undefined,
    criticality: vm.criticality,
    status: vm.status,
    powerState: vm.powerState,
    backupEnabled: vm.backupEnabled,
    monitoringEnabled: vm.monitoringEnabled,
    patchGroup: vm.patchGroup ?? undefined,
    location: vm.location ?? undefined,
    datacenter: vm.datacenter ?? undefined,
    cluster: vm.cluster ?? undefined,
    resourcePool: vm.resourcePool ?? undefined,
    costCenter: vm.costCenter ?? undefined,
    tags: vm.tags ?? [],
    notes: vm.notes ?? undefined,
    lastPatchDate: vm.lastPatchDate ? new Date(vm.lastPatchDate) : null,
    endOfLifeDate: vm.endOfLifeDate ? new Date(vm.endOfLifeDate) : null,
  };
}
