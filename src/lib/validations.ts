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
  email: z.string().email("Invalid email address"),
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

export const vmSchema = z.object({
  hostname: z.string().min(1, "Hostname is required").max(255),
  vmName: z.string().min(1, "VM name is required").max(255),
  description: z.string().optional(),
  environment: z.nativeEnum(Environment),
  platform: z.nativeEnum(Platform),
  ipAddress: z
    .string()
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Invalid IP address"
    )
    .optional()
    .or(z.literal("")),
  secondaryIp: z.string().optional(),
  osType: z.string().optional(),
  osVersion: z.string().optional(),
  cpuCores: z.coerce.number().int().min(1).max(512),
  memoryGB: z.coerce.number().int().min(1).max(4096),
  storageGB: z.coerce.number().int().min(1).max(102400),
  owner: z.string().optional(),
  department: z.string().optional(),
  businessUnit: z.string().optional(),
  application: z.string().optional(),
  criticality: z.nativeEnum(Criticality),
  status: z.nativeEnum(VMStatus),
  powerState: z.nativeEnum(PowerState),
  backupEnabled: z.boolean().default(false),
  monitoringEnabled: z.boolean().default(false),
  patchGroup: z.string().optional(),
  location: z.string().optional(),
  datacenter: z.string().optional(),
  cluster: z.string().optional(),
  resourcePool: z.string().optional(),
  costCenter: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  lastPatchDate: z.coerce.date().optional().nullable(),
  endOfLifeDate: z.coerce.date().optional().nullable(),
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
  hostname: z.string().min(1),
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
