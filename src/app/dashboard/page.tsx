"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Activity,
  AlertTriangle,
  Shield,
  HardDrive,
  Monitor,
  Clock,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#f97316", "#06b6d4", "#64748b"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const summary = data?.summary;
  const charts = data?.charts;
  const activity = data?.recentActivity ?? [];

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your virtual machine inventory and infrastructure"
        />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total VMs" value={summary?.totalVMs ?? 0} icon={Server} />
            <StatCard title="Active VMs" value={summary?.activeVMs ?? 0} icon={Activity} />
            <StatCard title="Inactive VMs" value={summary?.inactiveVMs ?? 0} icon={Server} />
            <StatCard title="Critical VMs" value={summary?.criticalVMs ?? 0} icon={AlertTriangle} />
            <StatCard title="Missing Backups" value={summary?.missingBackups ?? 0} icon={Shield} />
            <StatCard title="Missing Monitoring" value={summary?.missingMonitoring ?? 0} icon={Monitor} />
            <StatCard title="Near End of Life" value={summary?.nearEOL ?? 0} icon={Clock} />
            <StatCard title="Recently Added" value={summary?.recentlyAdded ?? 0} icon={Plus} />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ChartCard title="Platform Distribution" className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={charts?.platformDistribution ?? []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {(charts?.platformDistribution ?? []).map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Status Breakdown">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts?.statusBreakdown ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="VM Growth Trend">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={charts?.growthTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="OS Distribution">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(charts?.osDistribution ?? []).slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Department Distribution">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(charts?.departmentDistribution ?? []).slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Resource Overview">
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HardDrive className="h-4 w-4" /> Total CPU Cores
                  </span>
                  <span className="font-bold">{charts?.resourceTotals?.totalCpu ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Memory</span>
                  <span className="font-bold">{charts?.resourceTotals?.totalMemory ?? 0} GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Storage</span>
                  <span className="font-bold">{charts?.resourceTotals?.totalStorage ?? 0} GB</span>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Averages per VM</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{charts?.resourceTotals?.avgCpu ?? 0}</p>
                      <p className="text-xs text-muted-foreground">CPU</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{charts?.resourceTotals?.avgMemory ?? 0}</p>
                      <p className="text-xs text-muted-foreground">GB RAM</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{charts?.resourceTotals?.avgStorage ?? 0}</p>
                      <p className="text-xs text-muted-foreground">GB Disk</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Recent Activity" description="Latest changes across the platform">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.map((log: {
                id: string;
                action: string;
                entityType: string;
                timestamp: string;
                user?: { name: string };
              }) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{log.action}</Badge>
                    <div>
                      <p className="text-sm">
                        {log.entityType} {log.action.toLowerCase()}
                        {log.user && <span className="text-muted-foreground"> by {log.user.name}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </AppShell>
  );
}
