"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, UserX } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Role } from "@prisma/client";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" as Role, department: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(search ? { search } : {}) });
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, department: form.department || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: editingUser ? "User updated" : "User created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User disabled" });
    },
  });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "VIEWER", department: "" });
    setEditingUser(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (user: UserRecord) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, department: user.department || "" });
    setDialogOpen(true);
  };

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}>
      <div className="space-y-6">
        <PageHeader title="User Management" description="Manage user accounts and role assignments">
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add User</Button>
        </PageHeader>

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (data?.users ?? []).map((user: UserRecord) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{ROLE_LABELS[user.role]}</Badge></TableCell>
                  <TableCell>{user.department || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "secondary"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.isActive && (
                        <Button variant="ghost" size="icon" onClick={() => disableMutation.mutate(user.id)}>
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div>
              <Label>{editingUser ? "New Password (optional)" : "Password"}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
