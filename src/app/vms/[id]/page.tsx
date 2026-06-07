"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Pencil, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { VMForm } from "@/components/vm-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PLATFORM_LABELS,
  ENVIRONMENT_LABELS,
  VM_STATUS_LABELS,
  CRITICALITY_LABELS,
  POWER_STATE_LABELS,
} from "@/lib/validations";
import { formatDate, formatDateTime } from "@/lib/utils";
import { canModifyVMs } from "@/lib/rbac";
import { toVMFormValues } from "@/lib/vm-mapper";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function VMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vm", id],
    queryFn: async () => {
      const res = await fetch(`/api/vms/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: VMInput) => {
      const res = await fetch(`/api/vms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vm", id] });
      toast({ title: "VM updated successfully" });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const vm = data?.vm;
  const auditLogs = data?.auditLogs ?? [];
  const canEdit = session?.user?.role && canModifyVMs(session.user.role);

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-96" />
      </AppShell>
    );
  }

  if (!vm) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Virtual machine not found</p>
          <Button asChild className="mt-4"><Link href="/vms">Back to Inventory</Link></Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "VM Inventory", href: "/vms" },
      { label: vm.vmName },
    ]}>
      <div className="space-y-6">
        <PageHeader title={vm.vmName} description={vm.hostname}>
          <Button variant="outline" asChild>
            <Link href="/vms"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
          {canEdit && !editing && (
            <Button onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />Edit
            </Button>
          )}
        </PageHeader>

        <div className="flex flex-wrap gap-2">
          <Badge>{PLATFORM_LABELS[vm.platform]}</Badge>
          <Badge variant="outline">{ENVIRONMENT_LABELS[vm.environment]}</Badge>
          <Badge variant={vm.status === "ACTIVE" ? "success" : "secondary"}>{VM_STATUS_LABELS[vm.status]}</Badge>
          <Badge variant={vm.criticality === "CRITICAL" ? "danger" : "outline"}>{CRITICALITY_LABELS[vm.criticality]}</Badge>
        </div>

        {editing ? (
          <VMForm
            defaultValues={toVMFormValues(vm)}
            onSubmit={(data) => updateMutation.mutateAsync(data)}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        ) : (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
              <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
              <TabsTrigger value="audit">Audit Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <DetailCard title="Overview" items={[
                ["Hostname", vm.hostname],
                ["VM Name", vm.vmName],
                ["Description", vm.description || "—"],
                ["Tags", vm.tags?.length ? vm.tags.join(", ") : "—"],
              ]} />
              {vm.notes && (
                <Card>
                  <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-wrap">{vm.notes}</p></CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="infrastructure">
              <DetailCard title="Infrastructure" items={[
                ["Platform", PLATFORM_LABELS[vm.platform]],
                ["Datacenter", vm.datacenter || "—"],
                ["Cluster", vm.cluster || "—"],
                ["Resource Pool", vm.resourcePool || "—"],
                ["Location", vm.location || "—"],
                ["IP Address", vm.ipAddress || "—"],
                ["Secondary IP", vm.secondaryIp || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="resources">
              <DetailCard title="Resources" items={[
                ["CPU Cores", vm.cpuCores],
                ["Memory", `${vm.memoryGB} GB`],
                ["Storage", `${vm.storageGB} GB`],
                ["OS Type", vm.osType || "—"],
                ["OS Version", vm.osVersion || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="ownership">
              <DetailCard title="Ownership" items={[
                ["Owner", vm.owner || "—"],
                ["Department", vm.department || "—"],
                ["Business Unit", vm.businessUnit || "—"],
                ["Application", vm.application || "—"],
                ["Cost Center", vm.costCenter || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="lifecycle">
              <DetailCard title="Lifecycle & Operations" items={[
                ["Created Date", formatDate(vm.createdDate)],
                ["Last Updated", formatDate(vm.updatedDate)],
                ["Last Patch Date", formatDate(vm.lastPatchDate)],
                ["End of Life", formatDate(vm.endOfLifeDate)],
                ["Status", VM_STATUS_LABELS[vm.status]],
                ["Power State", POWER_STATE_LABELS[vm.powerState]],
                ["Backup", vm.backupEnabled ? "Enabled" : "Disabled"],
                ["Monitoring", vm.monitoringEnabled ? "Enabled" : "Disabled"],
                ["Patch Group", vm.patchGroup || "—"],
              ]} />
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader><CardTitle>Change History</CardTitle></CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit records</p>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map((log: {
                        id: string;
                        action: string;
                        timestamp: string;
                        user?: { name: string };
                      }) => (
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
