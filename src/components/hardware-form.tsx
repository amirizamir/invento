"use client";

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
  hardwareSchema,
  type HardwareInput,
  HARDWARE_CATEGORY_LABELS,
  HARDWARE_MANUFACTURER_LABELS,
  FORM_FACTOR_OPTIONS,
  STORAGE_TYPE_OPTIONS,
} from "@/lib/hardware-validations";
import {
  VM_STATUS_LABELS,
  CRITICALITY_LABELS,
  ENVIRONMENT_LABELS,
} from "@/lib/validations";
import {
  HardwareCategory,
  HardwareManufacturer,
  VMStatus,
  Criticality,
  Environment,
} from "@prisma/client";

interface HardwareFormProps {
  defaultValues?: Partial<HardwareInput>;
  onSubmit: (data: HardwareInput) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export function HardwareForm({ defaultValues, onSubmit, loading, submitLabel = "Save" }: HardwareFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HardwareInput>({
    resolver: zodResolver(hardwareSchema) as Resolver<HardwareInput>,
    defaultValues: {
      category: HardwareCategory.OTHER,
      manufacturer: HardwareManufacturer.OTHER,
      status: VMStatus.PENDING,
      criticality: Criticality.MEDIUM,
      environment: Environment.PRODUCTION,
      monitoringEnabled: false,
      encryptionCapable: false,
      tags: [],
      complianceTags: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Identity & Classification</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Asset ID" error={errors.assetId?.message}><Input {...register("assetId")} placeholder="IT asset tag" /></Field>
          <Field label="Name *" error={errors.name?.message}><Input {...register("name")} placeholder="e.g. Core Switch DC1" /></Field>
          <Field label="Category">
            <Controller name="category" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(HARDWARE_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Manufacturer">
            <Controller name="manufacturer" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(HARDWARE_MANUFACTURER_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Model"><Input {...register("model")} placeholder="e.g. PowerEdge R750, Catalyst 9300" /></Field>
          <Field label="Serial Number"><Input {...register("serialNumber")} /></Field>
          <Field label="Part Number"><Input {...register("partNumber")} /></Field>
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
          <div className="md:col-span-2">
            <Field label="Description"><Textarea {...register("description")} rows={2} /></Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location & Rack</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Data Center"><Input {...register("datacenter")} /></Field>
          <Field label="Site"><Input {...register("site")} /></Field>
          <Field label="Room"><Input {...register("room")} /></Field>
          <Field label="Rack"><Input {...register("rack")} placeholder="e.g. Rack A12" /></Field>
          <Field label="Rack Unit (U)"><Input {...register("rackUnit")} placeholder="e.g. U10-U11" /></Field>
          <Field label="Location Notes"><Input {...register("location")} /></Field>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Network & Management</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Hostname"><Input {...register("hostname")} /></Field>
          <Field label="Management IP" error={errors.managementIp?.message}><Input {...register("managementIp")} /></Field>
          <Field label="MAC Address"><Input {...register("macAddress")} /></Field>
          <Field label="VLAN"><Input {...register("vlan")} /></Field>
          <Field label="Subnet"><Input {...register("subnet")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="CPU Model"><Input {...register("cpuModel")} /></Field>
          <Field label="CPU Cores" error={errors.cpuCores?.message}><Input type="number" {...register("cpuCores")} /></Field>
          <Field label="RAM (GB)" error={errors.ramGB?.message}><Input type="number" {...register("ramGB")} /></Field>
          <Field label="Storage (GB)" error={errors.storageGB?.message}><Input type="number" {...register("storageGB")} /></Field>
          <Field label="Storage Type">
            <Controller name="storageType" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {STORAGE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Port Count" error={errors.portCount?.message}><Input type="number" {...register("portCount")} placeholder="Switches / routers" /></Field>
          <Field label="Firmware Version"><Input {...register("firmwareVersion")} /></Field>
          <Field label="BIOS Version"><Input {...register("biosVersion")} /></Field>
          <Field label="OS / DSM Version"><Input {...register("osVersion")} placeholder="NAS, HSM firmware" /></Field>
          <Field label="Form Factor">
            <Controller name="formFactor" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select form factor" /></SelectTrigger>
                <SelectContent>
                  {FORM_FACTOR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </Field>
          <Field label="Power Supply (W)" error={errors.powerSupplyWatts?.message}><Input type="number" {...register("powerSupplyWatts")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lifecycle & Support</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Purchase Date"><Input type="date" {...register("purchaseDate")} /></Field>
          <Field label="Warranty Expiry"><Input type="date" {...register("warrantyExpiry")} /></Field>
          <Field label="Support Contract End"><Input type="date" {...register("supportContractEnd")} /></Field>
          <Field label="End of Life Date"><Input type="date" {...register("endOfLifeDate")} /></Field>
          <Field label="Last Maintenance Date"><Input type="date" {...register("lastMaintenanceDate")} /></Field>
          <Field label="Vendor"><Input {...register("vendor")} /></Field>
          <Field label="PO Number"><Input {...register("poNumber")} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ownership & Security</CardTitle></CardHeader>
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
          <Field label="Owner"><Input {...register("owner")} /></Field>
          <Field label="Department"><Input {...register("department")} /></Field>
          <Field label="Business Unit"><Input {...register("businessUnit")} /></Field>
          <Field label="Cost Center"><Input {...register("costCenter")} /></Field>
          <Field label="Created By"><Input {...register("createdBy")} readOnly className="bg-muted" /></Field>
          <div className="flex items-center gap-2">
            <Controller name="monitoringEnabled" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Monitoring Enabled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller name="encryptionCapable" control={control} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label>Encryption Capable (HSM, etc.)</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Compliance Tags</Label>
            <Controller
              name="complianceTags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="PCI, HIPAA, SOX..." />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes & Tags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea {...register("notes")} rows={3} placeholder="Additional notes..." />
          <div>
            <Label>Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
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
