import type { VMInput } from "@/lib/validations";

type VMRecord = {
  vmId?: string | null;
  hostname: string;
  vmName: string;
  description?: string | null;
  environment: VMInput["environment"];
  platform: VMInput["platform"];
  useCase?: string | null;
  ipAddress?: string | null;
  secondaryIp?: string | null;
  tertiaryIp?: string | null;
  sshPort?: number | null;
  rdpPort?: number | null;
  remoteAccessMethod?: string | null;
  dnsRecords?: string | null;
  vlan?: string | null;
  firewallZone?: string | null;
  osType?: string | null;
  osVersion?: string | null;
  kernelVersion?: string | null;
  installedServices?: string | null;
  cpuCores: number;
  memoryGB: number;
  storageGB: number;
  physicalHost?: string | null;
  datacenter?: string | null;
  diskType?: string | null;
  storageDatastore?: string | null;
  haEnabled: boolean;
  cluster?: string | null;
  backupPolicy?: string | null;
  backupType?: string | null;
  patchLevel?: string | null;
  antivirusAgent?: string | null;
  siemAgent?: string | null;
  monitoringStack?: string | null;
  antivirusInstalled: boolean;
  lastVulnerabilityScanDate?: string | Date | null;
  cisStigHardening: boolean;
  encryptionAtRest: boolean;
  complianceTags: string[];
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
  resourcePool?: string | null;
  costCenter?: string | null;
  tags: string[];
  notes?: string | null;
  createdBy?: string | null;
  lastPatchDate?: string | Date | null;
  endOfLifeDate?: string | Date | null;
};

export function toVMFormValues(vm: VMRecord): VMInput {
  return {
    vmId: vm.vmId ?? undefined,
    hostname: vm.hostname,
    vmName: vm.vmName,
    description: vm.description ?? undefined,
    environment: vm.environment,
    platform: vm.platform,
    useCase: vm.useCase ?? undefined,
    ipAddress: vm.ipAddress ?? "",
    secondaryIp: vm.secondaryIp ?? undefined,
    tertiaryIp: vm.tertiaryIp ?? undefined,
    sshPort: vm.sshPort ?? null,
    rdpPort: vm.rdpPort ?? null,
    remoteAccessMethod: vm.remoteAccessMethod ?? undefined,
    dnsRecords: vm.dnsRecords ?? undefined,
    vlan: vm.vlan ?? undefined,
    firewallZone: vm.firewallZone ?? undefined,
    osType: vm.osType ?? undefined,
    osVersion: vm.osVersion ?? undefined,
    kernelVersion: vm.kernelVersion ?? undefined,
    installedServices: vm.installedServices ?? undefined,
    cpuCores: vm.cpuCores,
    memoryGB: vm.memoryGB,
    storageGB: vm.storageGB,
    physicalHost: vm.physicalHost ?? undefined,
    datacenter: vm.datacenter ?? undefined,
    diskType: vm.diskType ?? undefined,
    storageDatastore: vm.storageDatastore ?? undefined,
    haEnabled: vm.haEnabled,
    cluster: vm.cluster ?? undefined,
    backupPolicy: vm.backupPolicy ?? undefined,
    backupType: vm.backupType ?? undefined,
    patchLevel: vm.patchLevel ?? undefined,
    antivirusAgent: vm.antivirusAgent ?? undefined,
    siemAgent: vm.siemAgent ?? undefined,
    monitoringStack: vm.monitoringStack ?? undefined,
    antivirusInstalled: vm.antivirusInstalled,
    lastVulnerabilityScanDate: vm.lastVulnerabilityScanDate
      ? new Date(vm.lastVulnerabilityScanDate)
      : null,
    cisStigHardening: vm.cisStigHardening,
    encryptionAtRest: vm.encryptionAtRest,
    complianceTags: vm.complianceTags ?? [],
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
    resourcePool: vm.resourcePool ?? undefined,
    costCenter: vm.costCenter ?? undefined,
    tags: vm.tags ?? [],
    notes: vm.notes ?? undefined,
    createdBy: vm.createdBy ?? undefined,
    lastPatchDate: vm.lastPatchDate ? new Date(vm.lastPatchDate) : null,
    endOfLifeDate: vm.endOfLifeDate ? new Date(vm.endOfLifeDate) : null,
  };
}
