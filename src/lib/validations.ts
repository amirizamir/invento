import { z } from "zod";
import {
  Criticality,
  Environment,
  Platform,
  PowerState,
  Role,
  VMStatus,
} from "@prisma/client";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .optional(),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userSchema.partial().extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .optional()
    .or(z.literal("")),
});

const optionalString = z.string().optional().or(z.literal(""));

const optionalIp = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    "Invalid IP address"
  )
  .optional()
  .or(z.literal(""));

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const n = Number(val);
      return Number.isNaN(n) ? null : n;
    },
    z.number().int().min(min).max(max).nullable().optional()
  );

const optionalBool = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  },
  z.boolean().optional()
);

const optionalDate = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return null;
    return val;
  },
  z.coerce.date().nullable().optional()
);

export const vmSchema = z.object({
  vmId: optionalString,
  hostname: optionalString,
  vmName: z.string().min(1, "VM name is required").max(255),
  description: optionalString,
  environment: z.nativeEnum(Environment).optional(),
  platform: z.nativeEnum(Platform).optional(),
  useCase: optionalString,
  ipAddress: optionalIp,
  secondaryIp: optionalString,
  tertiaryIp: optionalString,
  sshPort: optionalInt(1, 65535),
  rdpPort: optionalInt(1, 65535),
  remoteAccessMethod: optionalString,
  dnsRecords: optionalString,
  vlan: optionalString,
  firewallZone: optionalString,
  osType: optionalString,
  osVersion: optionalString,
  kernelVersion: optionalString,
  installedServices: optionalString,
  cpuCores: optionalInt(1, 512),
  memoryGB: optionalInt(1, 4096),
  storageGB: optionalInt(1, 102400),
  physicalHost: optionalString,
  datacenter: optionalString,
  diskType: optionalString,
  storageDatastore: optionalString,
  haEnabled: optionalBool,
  cluster: optionalString,
  backupPolicy: optionalString,
  backupType: optionalString,
  patchLevel: optionalString,
  antivirusAgent: optionalString,
  siemAgent: optionalString,
  monitoringStack: optionalString,
  antivirusInstalled: optionalBool,
  lastVulnerabilityScanDate: optionalDate,
  cisStigHardening: optionalBool,
  encryptionAtRest: optionalBool,
  complianceTags: z.array(z.string()).optional(),
  owner: optionalString,
  department: optionalString,
  businessUnit: optionalString,
  application: optionalString,
  criticality: z.nativeEnum(Criticality).optional(),
  status: z.nativeEnum(VMStatus).optional(),
  powerState: z.nativeEnum(PowerState).optional(),
  backupEnabled: optionalBool,
  monitoringEnabled: optionalBool,
  patchGroup: optionalString,
  location: optionalString,
  resourcePool: optionalString,
  costCenter: optionalString,
  tags: z.array(z.string()).optional(),
  notes: optionalString,
  createdBy: optionalString,
  lastPatchDate: optionalDate,
  endOfLifeDate: optionalDate,
});

export const vmQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  platform: z.nativeEnum(Platform).optional(),
  environment: z.nativeEnum(Environment).optional(),
  status: z.nativeEnum(VMStatus).optional(),
  criticality: z.nativeEnum(Criticality).optional(),
  department: z.string().optional(),
  powerState: z.nativeEnum(PowerState).optional(),
});

export const importRowSchema = vmSchema.partial().extend({
  vmName: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type VMInput = z.infer<typeof vmSchema>;
export type VMQueryInput = z.infer<typeof vmQuerySchema>;

export const VM_STATUS_LABELS: Record<VMStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DECOMMISSIONED: "Decommissioned",
  MAINTENANCE: "Maintenance",
  PENDING: "Pending",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  VMWARE: "VMware",
  HYPERV: "Hyper-V",
  AWS: "AWS EC2",
  AZURE: "Azure VMs",
  GCP: "Google Cloud",
  PROXMOX: "Proxmox",
  OPENSTACK: "OpenStack",
  OTHER: "Other",
};

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  DEV: "Development",
  TEST: "Test",
  QA: "QA",
  STAGING: "Staging",
  PRODUCTION: "Production",
};

export const POWER_STATE_LABELS: Record<PowerState, string> = {
  ON: "On",
  OFF: "Off",
  SUSPENDED: "Suspended",
};

export const DISK_TYPE_OPTIONS = [
  "Thin",
  "Thick",
  "RAW",
  "qcow2",
  "Ceph",
  "Other",
] as const;

export const BACKUP_TYPE_OPTIONS = [
  "Full",
  "Incremental",
  "Differential",
  "Snapshot",
  "Other",
] as const;

export const REMOTE_ACCESS_OPTIONS = ["SSH", "RDP", "VPN", "Console", "Bastion", "Other"] as const;

export const ANTIVIRUS_OPTIONS = [
  "ClamAV (Linux)",
  "ESET (Windows)",
  "Not Applicable",
  "Other",
] as const;

export const SIEM_OPTIONS = ["Wazuh", "Not Applicable", "Other"] as const;

export const MONITORING_OPTIONS = ["Prometheus/Grafana", "Not Applicable", "Other"] as const;

export function resolveLoginEmail(username: string): string {
  const trimmed = username.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed}@ahg.local`;
}

export function isAgentActive(value?: string | null): boolean {
  return !!value && value !== "Not Applicable";
}
