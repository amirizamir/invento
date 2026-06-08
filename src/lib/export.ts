"use client";

import * as XLSX from "xlsx";
import Papa from "papaparse";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const csv = Papa.unparse(data);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = "Data"
): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export const CSV_TEMPLATE_HEADERS = [
  "vmId",
  "vmName",
  "environment",
  "application",
  "useCase",
  "status",
  "osType",
  "osVersion",
  "endOfLifeDate",
  "kernelVersion",
  "installedServices",
  "cpuCores",
  "memoryGB",
  "storageGB",
  "ipAddress",
  "hostname",
  "secondaryIp",
  "tertiaryIp",
  "sshPort",
  "rdpPort",
  "remoteAccessMethod",
  "dnsRecords",
  "vlan",
  "firewallZone",
  "platform",
  "physicalHost",
  "datacenter",
  "diskType",
  "storageDatastore",
  "haEnabled",
  "cluster",
  "backupPolicy",
  "backupType",
  "patchLevel",
  "lastPatchDate",
  "antivirusAgent",
  "siemAgent",
  "monitoringStack",
  "lastVulnerabilityScanDate",
  "cisStigHardening",
  "encryptionAtRest",
  "complianceTags",
  "criticality",
  "businessUnit",
  "department",
  "createdBy",
  "description",
  "owner",
  "powerState",
  "backupEnabled",
  "monitoringEnabled",
  "patchGroup",
  "location",
  "resourcePool",
  "costCenter",
  "tags",
  "notes",
];

export function downloadCSVTemplate() {
  const csv = Papa.unparse([CSV_TEMPLATE_HEADERS]);
  downloadFile(csv, "ahg-vm-import-template.csv", "text/csv;charset=utf-8;");
}
