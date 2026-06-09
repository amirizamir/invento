import { z } from "zod";
import {
  Criticality,
  Environment,
  HardwareCategory,
  HardwareManufacturer,
  PowerState,
  VMStatus,
} from "@prisma/client";

const optionalIp = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    "Invalid IP address"
  )
  .optional()
  .or(z.literal(""));

export const hardwareSchema = z.object({
  assetId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  category: z.nativeEnum(HardwareCategory),
  manufacturer: z.nativeEnum(HardwareManufacturer),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  partNumber: z.string().optional(),
  status: z.nativeEnum(VMStatus).optional(),
  powerState: z.nativeEnum(PowerState).optional(),
  criticality: z.nativeEnum(Criticality).optional(),
  environment: z.nativeEnum(Environment).optional(),
  datacenter: z.string().optional(),
  site: z.string().optional(),
  room: z.string().optional(),
  rack: z.string().optional(),
  rackUnit: z.string().optional(),
  location: z.string().optional(),
  hostname: z.string().optional(),
  managementIp: optionalIp,
  macAddress: z.string().optional(),
  vlan: z.string().optional(),
  subnet: z.string().optional(),
  cpuModel: z.string().optional(),
  cpuCores: z.coerce.number().int().min(0).max(512).optional().nullable(),
  ramGB: z.coerce.number().int().min(0).max(4096).optional().nullable(),
  storageGB: z.coerce.number().int().min(0).max(1024000).optional().nullable(),
  storageType: z.string().optional(),
  portCount: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  firmwareVersion: z.string().optional(),
  biosVersion: z.string().optional(),
  osVersion: z.string().optional(),
  formFactor: z.string().optional(),
  powerSupplyWatts: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiry: z.coerce.date().optional().nullable(),
  supportContractEnd: z.coerce.date().optional().nullable(),
  vendor: z.string().optional(),
  poNumber: z.string().optional(),
  endOfLifeDate: z.coerce.date().optional().nullable(),
  lastMaintenanceDate: z.coerce.date().optional().nullable(),
  owner: z.string().optional(),
  department: z.string().optional(),
  businessUnit: z.string().optional(),
  costCenter: z.string().optional(),
  monitoringEnabled: z.boolean(),
  encryptionCapable: z.boolean(),
  complianceTags: z.array(z.string()),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const hardwareQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  category: z.nativeEnum(HardwareCategory).optional(),
  manufacturer: z.nativeEnum(HardwareManufacturer).optional(),
  status: z.nativeEnum(VMStatus).optional(),
  criticality: z.nativeEnum(Criticality).optional(),
  environment: z.nativeEnum(Environment).optional(),
  department: z.string().optional(),
});

export type HardwareInput = z.infer<typeof hardwareSchema>;
export type HardwareQueryInput = z.infer<typeof hardwareQuerySchema>;

export const HARDWARE_CATEGORY_LABELS: Record<HardwareCategory, string> = {
  SERVER: "Server",
  SWITCH: "Switch",
  ROUTER: "Router",
  FIREWALL: "Firewall",
  HSM: "HSM",
  NAS: "NAS (Synology, etc.)",
  STORAGE: "Storage",
  UPS: "UPS / PDU",
  OTHER: "Other",
};

export const HARDWARE_MANUFACTURER_LABELS: Record<HardwareManufacturer, string> = {
  DELL: "Dell",
  CISCO: "Cisco",
  SYNOLOGY: "Synology",
  HPE: "HPE",
  HP: "HP",
  JUNIPER: "Juniper",
  FORTINET: "Fortinet",
  PALO_ALTO: "Palo Alto",
  THALES: "Thales",
  IBM: "IBM",
  LENOVO: "Lenovo",
  SUPERMICRO: "Supermicro",
  APC: "APC",
  NETAPP: "NetApp",
  OTHER: "Other",
};

export const FORM_FACTOR_OPTIONS = ["1U", "2U", "3U", "4U", "Blade", "Tower", "Desktop", "Rackmount", "Other"] as const;

export const STORAGE_TYPE_OPTIONS = ["HDD", "SSD", "NVMe", "Hybrid", "SAN", "Other"] as const;
