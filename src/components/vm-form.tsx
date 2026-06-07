"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/tag-input";
import {
  vmSchema,
  type VMInput,
  PLATFORM_LABELS,
  ENVIRONMENT_LABELS,
  VM_STATUS_LABELS,
  CRITICALITY_LABELS,
  DISK_TYPE_OPTIONS,
  BACKUP_TYPE_OPTIONS,
  REMOTE_ACCESS_OPTIONS,
} from "@/lib/validations";
import {
  Platform,
  Environment,
  VMStatus,
  Criticality,
  PowerState,
} from "@prisma/client";

interface VMFormProps {
  defaultValues?: Partial<VMInput>;
  onSubmit: (data: VMInput) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  draftKey?: string;
}

export function VMForm({ defaultValues, onSubmit, loading, submitLabel = "Save", draftKey }: VMFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<VMInput>({
    resolver: zodResolver(vmSchema) as Resolver<VMInput>,
    defaultValues: {
      cpuCores: 2,
      memoryGB: 8,
      storageGB: 100,
      environment: Environment.DEV,
      platform: Platform.OTHER,
      criticality: Criticality.MEDIUM,
      status: VMStatus.PENDING,
      powerState: PowerState.OFF,
      backupEnabled: false,
      monitoringEnabled: false,
      haEnabled: false,
      antivirusInstalled: false,
      cisStigHardening: false,
      encryptionAtRest: false,
      tags: [],
      complianceTags: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (draftKey) {
      const saved = localStorage.getItem(`vm-draft-${draftKey}`);
      if (saved && !defaultValues) {
        try {
          reset(JSON.parse(saved));
        } catch { /* ignore */ }
      }
    }
  }, [draftKey, defaultValues, reset]);

  useEffect(() => {
    if (!draftKey) return;
    const subscription = watch((value) => {
      localStorage.setItem(`vm-draft-${draftKey}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, draftKey]);

  const clearDraft = () => {
    if (draftKey) localStorage.removeItem(`vm-draft-${draftKey}`);
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        clearDraft();
      })}
      className="space-y-6"
    >
      <Card>
        <CardHeader><CardTitle>Identity & Core</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="VM ID" error={errors.vmId?.message}><Input {...register("vmId")} placeholder="External VM identifier" /></Field>
          <Field label="VM Name *" error={errors.vmName?.message}><Input {...register("vmName")} /></Field>
          <Field label="Environment">
            <Controller name="environment" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ENVIRONMENT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Application Name"><Input {...register("application")} /></Field>
          <Field label="Use Case"><Input {...register("useCase")} /></Field>
          <Field label="Status">
            <Controller name="status" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VM_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>OS & Compute</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="OS Type"><Input {...register("osType")} /></Field>
          <Field label="OS Version"><Input {...register("osVersion")} /></Field>
          <Field label="OS End-of-Life Date"><Input type="date" {...register("endOfLifeDate")} /></Field>
          <Field label="Kernel Version"><Input {...register("kernelVersion")} /></Field>
          <div className="md:col-span-2">
            <Field label="Installed Services"><Textarea {...register("installedServices")} rows={2} placeholder="Comma-separated or one per line" /></Field>
          </div>
          <Field label="vCPU" error={errors.cpuCores?.message}><Input type="number" {...register("cpuCores")} /></Field>
          <Field label="RAM (GB)" error={errors.memoryGB?.message}><Input type="number" {...register("memoryGB")} /></Field>
          <Field label="HDD Size (GB)" error={errors.storageGB?.message}><Input type="number" {...register("storageGB")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Network & Access</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="IP Address" error={errors.ipAddress?.message}><Input {...register("ipAddress")} /></Field>
          <Field label="FQDN / Hostname *" error={errors.hostname?.message}><Input {...register("hostname")} /></Field>
          <Field label="Secondary IPs"><Input {...register("secondaryIp")} /></Field>
          <Field label="Additional IP Address"><Input {...register("tertiaryIp")} /></Field>
          <Field label="SSH Port" error={errors.sshPort?.message}><Input type="number" {...register("sshPort")} /></Field>
          <Field label="RDP Port" error={errors.rdpPort?.message}><Input type="number" {...register("rdpPort")} /></Field>
          <Field label="Remote Access Method">
            <Controller name="remoteAccessMethod" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {REMOTE_ACCESS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="DNS Record(s)"><Input {...register("dnsRecords")} /></Field>
          <Field label="VLAN"><Input {...register("vlan")} /></Field>
          <Field label="Firewall Zone / Security Group"><Input {...register("firewallZone")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Infrastructure</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Platform">
            <Controller name="platform" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Physical Host"><Input {...register("physicalHost")} /></Field>
          <Field label="Data Center"><Input {...register("datacenter")} /></Field>
          <Field label="Disk Type (Thin/Thick)">
            <Controller name="diskType" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select disk type" /></SelectTrigger>
                <SelectContent>
                  {DISK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Storage Datastore / Pool"><Input {...register("storageDatastore")} /></Field>
          <div className="flex items-center gap-2 pt-6">
            <Controller name="haEnabled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>HA Enabled</Label>
          </div>
          <Field label="Cluster Membership"><Input {...register("cluster")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Backup & DR</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Backup Policy"><Input {...register("backupPolicy")} /></Field>
          <Field label="Backup Type">
            <Controller name="backupType" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select backup type" /></SelectTrigger>
                <SelectContent>
                  {BACKUP_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <div className="flex items-center gap-2">
            <Controller name="backupEnabled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Backup Enabled</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Patching & Security</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Patch Level"><Input {...register("patchLevel")} /></Field>
          <Field label="Last Patched Date"><Input type="date" {...register("lastPatchDate")} /></Field>
          <div className="flex items-center gap-2">
            <Controller name="antivirusInstalled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Antivirus / EDR Agent Installed</Label>
          </div>
          <Field label="Last Vulnerability Scan Date"><Input type="date" {...register("lastVulnerabilityScanDate")} /></Field>
          <div className="flex items-center gap-2">
            <Controller name="cisStigHardening" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>CIS/STIG Hardening Applied</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller name="encryptionAtRest" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Encryption at Rest</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Compliance Tags (PCI/HIPAA/SOX)</Label>
            <Controller
              name="complianceTags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Add compliance tag..." />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ownership & Criticality</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Criticality">
            <Controller name="criticality" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CRITICALITY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Business Unit / Department"><Input {...register("businessUnit")} /></Field>
          <Field label="Department"><Input {...register("department")} /></Field>
          <Field label="Created By"><Input {...register("createdBy")} readOnly className="bg-muted" /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea {...register("notes")} rows={3} placeholder="Additional notes..." />
          <div>
            <Label>General Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
