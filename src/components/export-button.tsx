"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel } from "@/lib/export";

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  disabled,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(true);
    try {
      if (format === "csv") exportToCSV(data, filename);
      else exportToExcel(data, filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || exporting || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
