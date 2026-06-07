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
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Plus, Trash2, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ExportButton } from "@/components/export-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PLATFORM_LABELS,
  ENVIRONMENT_LABELS,
  VM_STATUS_LABELS,
  CRITICALITY_LABELS,
  POWER_STATE_LABELS,
} from "@/lib/validations";
import { canDeleteVMs, canModifyVMs } from "@/lib/rbac";
import { toast } from "@/hooks/use-toast";
import { Platform, Environment, VMStatus, Criticality, PowerState } from "@prisma/client";

interface VM {
  id: string;
  hostname: string;
  vmName: string;
  platform: Platform;
  environment: Environment;
  ipAddress: string | null;
  osType: string | null;
  cpuCores: number;
  memoryGB: number;
  storageGB: number;
  owner: string | null;
  department: string | null;
  status: VMStatus;
  criticality: Criticality;
  powerState: PowerState;
  location: string | null;
}

export default function VMsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [environment, setEnvironment] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    ...(search ? { search } : {}),
    ...(platform ? { platform } : {}),
    ...(environment ? { environment } : {}),
    ...(status ? { status } : {}),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["vms", page, search, platform, environment, status],
    queryFn: async () => {
      const res = await fetch(`/api/vms?${queryParams}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as { vms: VM[]; pagination: { total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vms/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vms"] });
      toast({ title: "VM deleted successfully" });
      setDeleteOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const columns = useMemo<ColumnDef<VM>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "hostname",
        header: "Hostname",
        cell: ({ row }) => (
          <Link href={`/vms/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.hostname}
          </Link>
        ),
      },
      { accessorKey: "vmName", header: "VM Name" },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => PLATFORM_LABELS[row.original.platform],
      },
      {
        accessorKey: "environment",
        header: "Environment",
        cell: ({ row }) => (
          <Badge variant="outline">{ENVIRONMENT_LABELS[row.original.environment]}</Badge>
        ),
      },
      { accessorKey: "ipAddress", header: "IP Address", cell: ({ row }) => row.original.ipAddress || "—" },
      { accessorKey: "osType", header: "OS", cell: ({ row }) => row.original.osType || "—" },
      { accessorKey: "cpuCores", header: "CPU" },
      { accessorKey: "memoryGB", header: "Memory", cell: ({ row }) => `${row.original.memoryGB} GB` },
      { accessorKey: "storageGB", header: "Storage", cell: ({ row }) => `${row.original.storageGB} GB` },
      { accessorKey: "owner", header: "Owner", cell: ({ row }) => row.original.owner || "—" },
      { accessorKey: "department", header: "Department", cell: ({ row }) => row.original.department || "—" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          const variant = s === "ACTIVE" ? "success" : s === "INACTIVE" ? "secondary" : s === "MAINTENANCE" ? "warning" : "outline";
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
        accessorKey: "powerState",
        header: "Power",
        cell: ({ row }) => POWER_STATE_LABELS[row.original.powerState],
      },
      { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location || "—" },
      {
        id: "actions",
        cell: ({ row }) =>
          session?.user?.role && canDeleteVMs(session.user.role) ? (
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
    data: data?.vms ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { columnVisibility, rowSelection },
  });

  const exportData = (data?.vms ?? []).map((vm) => ({
    hostname: vm.hostname,
    vmName: vm.vmName,
    platform: vm.platform,
    environment: vm.environment,
    ipAddress: vm.ipAddress,
    osType: vm.osType,
    cpuCores: vm.cpuCores,
    memoryGB: vm.memoryGB,
    storageGB: vm.storageGB,
    owner: vm.owner,
    department: vm.department,
    status: vm.status,
    criticality: vm.criticality,
    powerState: vm.powerState,
    location: vm.location,
  }));

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "VM Inventory" }]}>
      <div className="space-y-6">
        <PageHeader title="VM Inventory" description="Manage and monitor all virtual machines">
          <ExportButton data={exportData} filename="vm-inventory" />
          {session?.user?.role && canModifyVMs(session.user.role) && (
            <Button asChild>
              <Link href="/vms/new">
                <Plus className="h-4 w-4 mr-2" />
                Add VM
              </Link>
            </Button>
          )}
        </PageHeader>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search hostname, name, IP, owner..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            className="max-w-sm"
          />
          <Select value={platform} onValueChange={(v) => { setPlatform(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={environment} onValueChange={(v) => { setEnvironment(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Environment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              {Object.entries(ENVIRONMENT_LABELS).map(([k, v]) => (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><Settings2 className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                    No virtual machines found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
            {Object.keys(rowSelection).length > 0 && ` · ${Object.keys(rowSelection).length} selected`}
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
        title="Delete Virtual Machine"
        description="This action cannot be undone. The VM record will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </AppShell>
  );
}
