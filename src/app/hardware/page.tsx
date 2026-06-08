"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ExportButton } from "@/components/export-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HARDWARE_CATEGORY_LABELS,
  HARDWARE_MANUFACTURER_LABELS,
} from "@/lib/hardware-validations";
import { VM_STATUS_LABELS, CRITICALITY_LABELS } from "@/lib/validations";
import { canDeleteHardware, canModifyHardware } from "@/lib/rbac";
import { toast } from "@/hooks/use-toast";
import { HardwareCategory, HardwareManufacturer, VMStatus, Criticality } from "@prisma/client";

interface HardwareItem {
  id: string;
  assetId: string | null;
  name: string;
  category: HardwareCategory;
  manufacturer: HardwareManufacturer;
  model: string | null;
  serialNumber: string | null;
  status: VMStatus;
  criticality: Criticality;
  managementIp: string | null;
  hostname: string | null;
  rack: string | null;
  datacenter: string | null;
  owner: string | null;
  department: string | null;
}

export default function HardwarePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>("");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(manufacturer ? { manufacturer } : {}),
    ...(status ? { status } : {}),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hardware", page, search, category, manufacturer, status],
    queryFn: async () => {
      const res = await fetch(`/api/hardware?${queryParams}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as {
        hardware: HardwareItem[];
        pagination: { total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hardware/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware"] });
      toast({ title: "Hardware deleted successfully" });
      setDeleteOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const columns = useMemo<ColumnDef<HardwareItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/hardware/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "assetId", header: "Asset ID", cell: ({ row }) => row.original.assetId || "—" },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => HARDWARE_CATEGORY_LABELS[row.original.category],
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) => HARDWARE_MANUFACTURER_LABELS[row.original.manufacturer],
      },
      { accessorKey: "model", header: "Model", cell: ({ row }) => row.original.model || "—" },
      { accessorKey: "serialNumber", header: "Serial", cell: ({ row }) => row.original.serialNumber || "—" },
      { accessorKey: "managementIp", header: "Mgmt IP", cell: ({ row }) => row.original.managementIp || "—" },
      { accessorKey: "rack", header: "Rack", cell: ({ row }) => row.original.rack || "—" },
      { accessorKey: "datacenter", header: "DC", cell: ({ row }) => row.original.datacenter || "—" },
      { accessorKey: "owner", header: "Owner", cell: ({ row }) => row.original.owner || "—" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          const variant = s === "ACTIVE" ? "success" : s === "MAINTENANCE" ? "warning" : "outline";
          return <Badge variant={variant as "success"}>{VM_STATUS_LABELS[s]}</Badge>;
        },
      },
      {
        accessorKey: "criticality",
        header: "Criticality",
        cell: ({ row }) => {
          const c = row.original.criticality;
          const variant = c === "CRITICAL" ? "danger" : c === "HIGH" ? "warning" : "outline";
          return <Badge variant={variant as "danger"}>{CRITICALITY_LABELS[c]}</Badge>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) =>
          session?.user?.role && canDeleteHardware(session.user.role) ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleteId(row.original.id);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ) : null,
      },
    ],
    [session]
  );

  const table = useReactTable({
    data: data?.hardware ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exportData = (data?.hardware ?? []).map((item) => ({
    assetId: item.assetId,
    name: item.name,
    category: item.category,
    manufacturer: item.manufacturer,
    model: item.model,
    serialNumber: item.serialNumber,
    managementIp: item.managementIp,
    hostname: item.hostname,
    rack: item.rack,
    datacenter: item.datacenter,
    owner: item.owner,
    department: item.department,
    status: item.status,
    criticality: item.criticality,
  }));

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Hardware" }]}>
      <div className="space-y-6">
        <PageHeader title="Hardware" description="Dell servers, Cisco switches, HSM, Synology NAS, and other IT equipment">
          <ExportButton data={exportData} filename="hardware-inventory" />
          {session?.user?.role && canModifyHardware(session.user.role) && (
            <Button asChild>
              <Link href="/hardware/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Link>
            </Button>
          )}
        </PageHeader>

        <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap">
          <Input
            placeholder="Search name, asset ID, serial, IP..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            className="max-w-sm"
          />
          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(HARDWARE_CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={manufacturer} onValueChange={(v) => { setManufacturer(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Manufacturer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {Object.entries(HARDWARE_MANUFACTURER_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(VM_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No hardware equipment found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.pagination?.total ?? 0} total · Page {page} of {data?.pagination?.totalPages ?? 1}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!data?.pagination?.hasPrev} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.pagination?.hasNext} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Hardware"
        description="This action cannot be undone. The equipment record will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </AppShell>
  );
}
