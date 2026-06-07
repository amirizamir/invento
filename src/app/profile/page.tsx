"use client";

import { useSession } from "next-auth/react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}>
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Profile" description="Your account information" />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{session?.user?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge className="mt-1">
                  {session?.user?.role ? ROLE_LABELS[session.user.role] : "—"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{session?.user?.department || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
