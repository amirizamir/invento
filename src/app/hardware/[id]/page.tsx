"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Pencil, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { HardwareForm } from "@/components/hardware-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HARDWARE_CATEGORY_LABELS,
  HARDWARE_MANUFACTURER_LABELS,
} from "@/lib/hardware-validations";
import type { HardwareInput } from "@/lib/hardware-validations";
import { VM_STATUS_LABELS, CRITICALITY_LABELS, ENVIRONMENT_LABELS, POWER_STATE_LABELS } from "@/lib/validations";
import { formatDate, formatDateTime } from "@/lib/utils";
import { canModifyHardware } from "@/lib/rbac";
import { toHardwareFormValues } from "@/lib/hardware-mapper";
import { toast } from "@/hooks/use-toast";

export default function HardwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["hardware", id],
    queryFn: async () => {
      const res = await fetch(`/api/hardware/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: HardwareInput) => {
      const res = await fetch(`/api/hardware/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware", id] });
      toast({ title: "Hardware updated successfully" });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const hw = data?.hardware;
  const auditLogs = data?.auditLogs ?? [];
  const canEdit = session?.user?.role && canModifyHardware(session.user.role);
  const boolLabel = (value: boolean) => (value ? "Yes" : "No");

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-96" />
      </AppShell>
    );
  }

  if (!hw) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Hardware equipment not found</p>
          <Button asChild className="mt-4"><Link href="/hardware">Back to Inventory</Link></Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Hardware", href: "/hardware" },
      { label: hw.name },
    ]}>
      <div className="space-y-6">
        <PageHeader title={hw.name} description={hw.assetId || hw.serialNumber || undefined}>
          <Button variant="outline" asChild>
            <Link href="/hardware"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
          {canEdit && !editing && (
            <Button onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />Edit
            </Button>
          )}
        </PageHeader>

        <div className="flex flex-wrap gap-2">
          <Badge>{HARDWARE_CATEGORY_LABELS[hw.category]}</Badge>
          <Badge variant="outline">{HARDWARE_MANUFACTURER_LABELS[hw.manufacturer]}</Badge>
          <Badge variant={hw.status === "ACTIVE" ? "success" : "secondary"}>{VM_STATUS_LABELS[hw.status]}</Badge>
          <Badge variant={hw.criticality === "CRITICAL" ? "danger" : "outline"}>{CRITICALITY_LABELS[hw.criticality]}</Badge>
        </div>

        {editing ? (
          <HardwareForm
            defaultValues={toHardwareFormValues(hw)}
            onSubmit={(data) => updateMutation.mutateAsync(data)}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        ) : (
          <Tabs defaultValue="identity">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="identity">
              <DetailCard title="Identity & Classification" items={[
                ["Asset ID", hw.assetId || "—"],
                ["Name", hw.name],
                ["Category", HARDWARE_CATEGORY_LABELS[hw.category]],
                ["Manufacturer", HARDWARE_MANUFACTURER_LABELS[hw.manufacturer]],
                ["Model", hw.model || "—"],
                ["Serial Number", hw.serialNumber || "—"],
                ["Part Number", hw.partNumber || "—"],
                ["Status", VM_STATUS_LABELS[hw.status]],
                ["Power State", POWER_STATE_LABELS[hw.powerState]],
                ["Description", hw.description || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="location">
              <DetailCard title="Location & Rack" items={[
                ["Data Center", hw.datacenter || "—"],
                ["Site", hw.site || "—"],
                ["Room", hw.room || "—"],
                ["Rack", hw.rack || "—"],
                ["Rack Unit", hw.rackUnit || "—"],
                ["Location", hw.location || "—"],
                ["Environment", ENVIRONMENT_LABELS[hw.environment]],
              ]} />
            </TabsContent>

            <TabsContent value="network">
              <DetailCard title="Network & Management" items={[
                ["Hostname", hw.hostname || "—"],
                ["Management IP", hw.managementIp || "—"],
                ["MAC Address", hw.macAddress || "—"],
                ["VLAN", hw.vlan || "—"],
                ["Subnet", hw.subnet || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="specs">
              <DetailCard title="Specifications" items={[
                ["CPU Model", hw.cpuModel || "—"],
                ["CPU Cores", hw.cpuCores ?? "—"],
                ["RAM (GB)", hw.ramGB ?? "—"],
                ["Storage (GB)", hw.storageGB ?? "—"],
                ["Storage Type", hw.storageType || "—"],
                ["Port Count", hw.portCount ?? "—"],
                ["Firmware", hw.firmwareVersion || "—"],
                ["BIOS", hw.biosVersion || "—"],
                ["OS / DSM Version", hw.osVersion || "—"],
                ["Form Factor", hw.formFactor || "—"],
                ["Power Supply (W)", hw.powerSupplyWatts ?? "—"],
              ]} />
            </TabsContent>

            <TabsContent value="lifecycle">
              <DetailCard title="Lifecycle & Support" items={[
                ["Purchase Date", formatDate(hw.purchaseDate)],
                ["Warranty Expiry", formatDate(hw.warrantyExpiry)],
                ["Support Contract End", formatDate(hw.supportContractEnd)],
                ["End of Life", formatDate(hw.endOfLifeDate)],
                ["Last Maintenance", formatDate(hw.lastMaintenanceDate)],
                ["Vendor", hw.vendor || "—"],
                ["PO Number", hw.poNumber || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="ownership" className="space-y-4">
              <DetailCard title="Ownership & Security" items={[
                ["Criticality", CRITICALITY_LABELS[hw.criticality]],
                ["Owner", hw.owner || "—"],
                ["Department", hw.department || "—"],
                ["Business Unit", hw.businessUnit || "—"],
                ["Cost Center", hw.costCenter || "—"],
                ["Created By", hw.createdBy || "—"],
                ["Created Date", formatDate(hw.createdDate)],
                ["Monitoring", boolLabel(hw.monitoringEnabled)],
                ["Encryption Capable", boolLabel(hw.encryptionCapable)],
                ["Compliance Tags", hw.complianceTags?.length ? hw.complianceTags.join(", ") : "—"],
              ]} />
              {hw.notes && (
                <Card>
                  <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-wrap">{hw.notes}</p></CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader><CardTitle>Change History</CardTitle></CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit records</p>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map((log: { id: string; action: string; timestamp: string; user?: { name: string } }) => (
                        <div key={log.id} className="flex gap-4 border-l-2 border-primary pl-4">
                          <div>
                            <Badge variant="outline">{log.action}</Badge>
                            <p className="text-sm mt-1">
                              {log.user?.name || "System"} · {formatDateTime(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}

function DetailCard({ title, items }: { title: string; items: [string, string | number][] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <dl className="grid gap-3 md:grid-cols-2">
          {items.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
