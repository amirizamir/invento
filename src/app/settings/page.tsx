"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}>
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Settings" description="System configuration and integrations" />

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect to VMware, Hyper-V, AWS, Azure, and GCP</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Integration connectors can be configured here. Contact your administrator to enable cloud provider sync.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Authentication and access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Session timeout: 8 hours</p>
            <p>Password policy: Minimum 8 characters with uppercase, lowercase, and number</p>
            <p>RBAC: Enabled</p>
            <p>Audit logging: Enabled</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
