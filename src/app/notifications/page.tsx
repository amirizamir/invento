"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      return json.data;
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}>
      <div className="space-y-6">
        <PageHeader title="Notifications" description="System alerts and inventory notifications">
          {(data?.unreadCount ?? 0) > 0 && (
            <Button variant="outline" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4 mr-2" />Mark All Read
            </Button>
          )}
        </PageHeader>

        {isLoading ? (
          <Skeleton className="h-64" />
        ) : (data?.notifications ?? []).length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No notifications</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(data?.notifications ?? []).map((n: {
              id: string;
              type: string;
              title: string;
              description: string;
              read: boolean;
              createdAt: string;
            }) => (
              <Card key={n.id} className={!n.read ? "border-primary/50" : ""}>
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.read && <Badge>New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead.mutate(n.id)}>Mark read</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
