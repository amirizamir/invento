"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ExportButton } from "@/components/export-button";
import { ChartCard } from "@/components/chart-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("infrastructure");

  const { data: infra, isLoading: infraLoading } = useQuery({
    queryKey: ["reports", "infrastructure"],
    queryFn: async () => {
      const res = await fetch("/api/reports?type=infrastructure");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: security, isLoading: secLoading } = useQuery({
    queryKey: ["reports", "security"],
    queryFn: async () => {
      const res = await fetch("/api/reports?type=security");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: lifecycle, isLoading: lifeLoading } = useQuery({
    queryKey: ["reports", "lifecycle"],
    queryFn: async () => {
      const res = await fetch("/api/reports?type=lifecycle");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: business, isLoading: bizLoading } = useQuery({
    queryKey: ["reports", "business"],
    queryFn: async () => {
      const res = await fetch("/api/reports?type=business");
      const json = await res.json();
      return json.data;
    },
  });

  const platformData = (infra?.platformDistribution ?? []).map((p: { platform: string; _count: { id: number } }) => ({
    name: p.platform,
    value: p._count.id,
  }));

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}>
      <div className="space-y-6">
        <PageHeader title="Reports" description="Infrastructure, security, lifecycle, and business analytics">
          <ExportButton
            data={platformData}
            filename="platform-report"
          />
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard title="Platform Distribution">
                {infraLoading ? <Skeleton className="h-64" /> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
              <ChartCard title="Capacity Usage">
                {infraLoading ? <Skeleton className="h-64" /> : (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between"><span>Total VMs</span><strong>{infra?.capacity?._count?.id ?? 0}</strong></div>
                    <div className="flex justify-between"><span>Total CPU</span><strong>{infra?.capacity?._sum?.cpuCores ?? 0} cores</strong></div>
                    <div className="flex justify-between"><span>Total Memory</span><strong>{infra?.capacity?._sum?.memoryGB ?? 0} GB</strong></div>
                    <div className="flex justify-between"><span>Total Storage</span><strong>{infra?.capacity?._sum?.storageGB ?? 0} GB</strong></div>
                  </div>
                )}
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {secLoading ? <Skeleton className="h-64" /> : (
              <div className="grid gap-4 md:grid-cols-3">
                <ReportList title="Missing Backups" items={security?.missingBackups ?? []} />
                <ReportList title="Missing Monitoring" items={security?.missingMonitoring ?? []} />
                <ReportList title="Stale Patches" items={security?.stalePatches ?? []} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="lifecycle" className="space-y-4">
            {lifeLoading ? <Skeleton className="h-64" /> : (
              <div className="grid gap-4 md:grid-cols-3">
                <ReportList title="EOL Systems" items={lifecycle?.eolSystems ?? []} />
                <ReportList title="Inactive Systems" items={lifecycle?.inactiveSystems ?? []} />
                <ReportList title="Decommission Candidates" items={lifecycle?.decommissionCandidates ?? []} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {bizLoading ? <Skeleton className="h-64" /> : (
              <ChartCard title="Department Usage">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(business?.departments ?? []).map((d: { department: string; _count: { id: number } }) => ({
                    name: d.department,
                    value: d._count.id,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function ReportList({ title, items }: { title: string; items: Array<{ id: string; hostname: string; vmName: string; criticality?: string }> }) {
  return (
    <ChartCard title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">None found</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.slice(0, 20).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b">
              <span>{item.vmName || item.hostname}</span>
              {item.criticality && <Badge variant="outline">{item.criticality}</Badge>}
            </div>
          ))}
          {items.length > 20 && <p className="text-xs text-muted-foreground">+{items.length - 20} more</p>}
        </div>
      )}
    </ChartCard>
  );
}
