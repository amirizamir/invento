"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/audit-logs");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Audit Logs" }]}>
      <div className="space-y-6">
        <PageHeader title="Audit Logs" description="Complete history of system changes and user activity" />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (data?.logs ?? []).map((log: {
                id: string;
                action: string;
                entityType: string;
                entityId: string | null;
                timestamp: string;
                user?: { name: string; email: string };
              }) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell>{log.entityType} {log.entityId && `(${log.entityId.slice(0, 8)}...)`}</TableCell>
                  <TableCell>{log.user?.name || "System"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
