"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { HardwareForm } from "@/components/hardware-form";
import type { HardwareInput } from "@/lib/hardware-validations";
import { toast } from "@/hooks/use-toast";

export default function NewHardwarePage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role === "VIEWER") router.push("/hardware");
  }, [session, router]);

  const mutation = useMutation({
    mutationFn: async (data: HardwareInput) => {
      const res = await fetch("/api/hardware", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast({ title: "Hardware added successfully" });
      router.push(`/hardware/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add hardware", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AppShell breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Hardware", href: "/hardware" },
      { label: "Add Equipment" },
    ]}>
      <div className="space-y-6 max-w-4xl">
        <PageHeader title="Add Hardware Equipment" description="Register servers, switches, HSM, NAS, and other IT assets" />
        <HardwareForm
          defaultValues={{ createdBy: session?.user?.name ?? undefined }}
          onSubmit={(data) => mutation.mutateAsync(data)}
          loading={mutation.isPending}
          submitLabel="Add Equipment"
        />
      </div>
    </AppShell>
  );
}
