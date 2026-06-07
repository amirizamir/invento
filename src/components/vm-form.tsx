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
  POWER_STATE_LABELS,
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
      tags: [],
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
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Hostname *" error={errors.hostname?.message}>
            <Input {...register("hostname")} />
          </Field>
          <Field label="VM Name *" error={errors.vmName?.message}>
            <Input {...register("vmName")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}>
              <Textarea {...register("description")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Label>Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Infrastructure</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Platform" error={errors.platform?.message}>
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
          <Field label="Environment" error={errors.environment?.message}>
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
          <Field label="Datacenter"><Input {...register("datacenter")} /></Field>
          <Field label="Cluster"><Input {...register("cluster")} /></Field>
          <Field label="Resource Pool"><Input {...register("resourcePool")} /></Field>
          <Field label="Location"><Input {...register("location")} /></Field>
          <Field label="IP Address" error={errors.ipAddress?.message}><Input {...register("ipAddress")} /></Field>
          <Field label="Secondary IP"><Input {...register("secondaryIp")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="CPU Cores" error={errors.cpuCores?.message}>
            <Input type="number" {...register("cpuCores")} />
          </Field>
          <Field label="Memory (GB)" error={errors.memoryGB?.message}>
            <Input type="number" {...register("memoryGB")} />
          </Field>
          <Field label="Storage (GB)" error={errors.storageGB?.message}>
            <Input type="number" {...register("storageGB")} />
          </Field>
          <Field label="OS Type"><Input {...register("osType")} /></Field>
          <Field label="OS Version"><Input {...register("osVersion")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ownership</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Owner"><Input {...register("owner")} /></Field>
          <Field label="Department"><Input {...register("department")} /></Field>
          <Field label="Business Unit"><Input {...register("businessUnit")} /></Field>
          <Field label="Application"><Input {...register("application")} /></Field>
          <Field label="Cost Center"><Input {...register("costCenter")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lifecycle & Operations</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
          <Field label="Power State">
            <Controller name="powerState" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(POWER_STATE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Patch Group"><Input {...register("patchGroup")} /></Field>
          <Field label="Last Patch Date"><Input type="date" {...register("lastPatchDate")} /></Field>
          <Field label="End of Life Date"><Input type="date" {...register("endOfLifeDate")} /></Field>
          <div className="flex items-center gap-2">
            <Controller name="backupEnabled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Backup Enabled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller name="monitoringEnabled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Monitoring Enabled</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea {...register("notes")} rows={5} placeholder="Additional notes, known issues..." />
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
