import type { HardwareInput } from "@/lib/hardware-validations";

type HardwareRecord = {
  assetId?: string | null;
  name: string;
  description?: string | null;
  category: HardwareInput["category"];
  manufacturer: HardwareInput["manufacturer"];
  model?: string | null;
  serialNumber?: string | null;
  partNumber?: string | null;
  status: HardwareInput["status"];
  powerState: HardwareInput["powerState"];
  criticality: HardwareInput["criticality"];
  environment: HardwareInput["environment"];
  datacenter?: string | null;
  site?: string | null;
  room?: string | null;
  rack?: string | null;
  rackUnit?: string | null;
  location?: string | null;
  hostname?: string | null;
  managementIp?: string | null;
  macAddress?: string | null;
  vlan?: string | null;
  subnet?: string | null;
  cpuModel?: string | null;
  cpuCores?: number | null;
  ramGB?: number | null;
  storageGB?: number | null;
  storageType?: string | null;
  portCount?: number | null;
  firmwareVersion?: string | null;
  biosVersion?: string | null;
  osVersion?: string | null;
  formFactor?: string | null;
  powerSupplyWatts?: number | null;
  purchaseDate?: string | Date | null;
  warrantyExpiry?: string | Date | null;
  supportContractEnd?: string | Date | null;
  vendor?: string | null;
  poNumber?: string | null;
  endOfLifeDate?: string | Date | null;
  lastMaintenanceDate?: string | Date | null;
  owner?: string | null;
  department?: string | null;
  businessUnit?: string | null;
  costCenter?: string | null;
  monitoringEnabled: boolean;
  encryptionCapable: boolean;
  complianceTags: string[];
  tags: string[];
  notes?: string | null;
  createdBy?: string | null;
};

function toDate(value?: string | Date | null) {
  return value ? new Date(value) : null;
}

export function toHardwareFormValues(record: HardwareRecord): HardwareInput {
  return {
    assetId: record.assetId ?? undefined,
    name: record.name,
    description: record.description ?? undefined,
    category: record.category,
    manufacturer: record.manufacturer,
    model: record.model ?? undefined,
    serialNumber: record.serialNumber ?? undefined,
    partNumber: record.partNumber ?? undefined,
    status: record.status,
    powerState: record.powerState,
    criticality: record.criticality,
    environment: record.environment,
    datacenter: record.datacenter ?? undefined,
    site: record.site ?? undefined,
    room: record.room ?? undefined,
    rack: record.rack ?? undefined,
    rackUnit: record.rackUnit ?? undefined,
    location: record.location ?? undefined,
    hostname: record.hostname ?? undefined,
    managementIp: record.managementIp ?? "",
    macAddress: record.macAddress ?? undefined,
    vlan: record.vlan ?? undefined,
    subnet: record.subnet ?? undefined,
    cpuModel: record.cpuModel ?? undefined,
    cpuCores: record.cpuCores ?? null,
    ramGB: record.ramGB ?? null,
    storageGB: record.storageGB ?? null,
    storageType: record.storageType ?? undefined,
    portCount: record.portCount ?? null,
    firmwareVersion: record.firmwareVersion ?? undefined,
    biosVersion: record.biosVersion ?? undefined,
    osVersion: record.osVersion ?? undefined,
    formFactor: record.formFactor ?? undefined,
    powerSupplyWatts: record.powerSupplyWatts ?? null,
    purchaseDate: toDate(record.purchaseDate),
    warrantyExpiry: toDate(record.warrantyExpiry),
    supportContractEnd: toDate(record.supportContractEnd),
    vendor: record.vendor ?? undefined,
    poNumber: record.poNumber ?? undefined,
    endOfLifeDate: toDate(record.endOfLifeDate),
    lastMaintenanceDate: toDate(record.lastMaintenanceDate),
    owner: record.owner ?? undefined,
    department: record.department ?? undefined,
    businessUnit: record.businessUnit ?? undefined,
    costCenter: record.costCenter ?? undefined,
    monitoringEnabled: record.monitoringEnabled,
    encryptionCapable: record.encryptionCapable,
    complianceTags: record.complianceTags ?? [],
    tags: record.tags ?? [],
    notes: record.notes ?? undefined,
    createdBy: record.createdBy ?? undefined,
  };
}
