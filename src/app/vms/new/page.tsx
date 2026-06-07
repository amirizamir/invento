"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { VMForm } from "@/components/vm-form";
import { type VMInput } from "@/lib/validations";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function NewVMPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role === "VIEWER") router.push("/vms");
  }, [session, router]);

  const mutation = useMutation({
    mutationFn: async (data: VMInput) => {
      const res = await fetch("/api/vms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast({ title: "VM created successfully" });
      router.push(`/vms/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create VM", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AppShell breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "VM Inventory", href: "/vms" },
      { label: "New VM" },
    ]}>
      <div className="space-y-6 max-w-4xl">
        <PageHeader title="Create Virtual Machine" description="Add a new VM to the inventory" />
        <VMForm
          defaultValues={{ createdBy: session?.user?.name ?? undefined }}
          onSubmit={(data) => mutation.mutateAsync(data)}
          loading={mutation.isPending}
          submitLabel="Create VM"
          draftKey={session?.user?.id}
        />
      </div>
    </AppShell>
  );
}
