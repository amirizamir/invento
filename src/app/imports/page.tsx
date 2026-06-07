"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCSVTemplate } from "@/lib/export";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ImportsPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["imports"],
    queryFn: async () => {
      const res = await fetch("/api/imports");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const importMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["vms"] });
      toast({
        title: "Import completed",
        description: `${result.successfulRecords} succeeded, ${result.failedRecords} failed`,
      });
      setFile(null);
    },
    onError: (err: Error) => {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    },
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED": return <XCircle className="h-4 w-4 text-red-500" />;
      case "PROCESSING": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Imports" }]}>
      <div className="space-y-6">
        <PageHeader title="CSV Import" description="Import virtual machines from CSV files">
          <Button variant="outline" onClick={downloadCSVTemplate}>
            <Download className="h-4 w-4 mr-2" />Download Template
          </Button>
        </PageHeader>

        <Card>
          <CardHeader><CardTitle>Upload CSV</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with VM inventory data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  onClick={() => importMutation.mutate(file)}
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? "Importing..." : "Start Import"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Import History</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (data?.imports ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No imports yet</p>
            ) : (
              <div className="space-y-3">
                {(data?.imports ?? []).map((job: {
                  id: string;
                  fileName: string;
                  status: string;
                  totalRecords: number;
                  successfulRecords: number;
                  failedRecords: number;
                  startedAt: string;
                  completedAt: string | null;
                  user?: { name: string };
                }) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      {statusIcon(job.status)}
                      <div>
                        <p className="text-sm font-medium">{job.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.successfulRecords}/{job.totalRecords} successful
                          {job.user && ` · by ${job.user.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{job.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(job.startedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
