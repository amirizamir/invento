import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createAuditLog(params: AuditLogParams) {
  return prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      oldValue: params.oldValue ? toJsonValue(params.oldValue) : undefined,
      newValue: params.newValue ? toJsonValue(params.newValue) : undefined,
    },
  });
}

export async function logLogin(userId: string) {
  return createAuditLog({
    action: "LOGIN",
    entityType: "User",
    entityId: userId,
    userId,
  });
}

export async function logVMCreate(userId: string, vm: unknown, vmId: string) {
  return createAuditLog({
    action: "CREATE",
    entityType: "VirtualMachine",
    entityId: vmId,
    userId,
    newValue: vm,
  });
}

export async function logVMUpdate(
  userId: string,
  vmId: string,
  oldValue: unknown,
  newValue: unknown
) {
  return createAuditLog({
    action: "UPDATE",
    entityType: "VirtualMachine",
    entityId: vmId,
    userId,
    oldValue,
    newValue,
  });
}

export async function logVMDelete(userId: string, vmId: string, oldValue: unknown) {
  return createAuditLog({
    action: "DELETE",
    entityType: "VirtualMachine",
    entityId: vmId,
    userId,
    oldValue,
  });
}

export async function logUserAction(
  action: string,
  userId: string,
  targetUserId: string,
  oldValue?: unknown,
  newValue?: unknown
) {
  return createAuditLog({
    action,
    entityType: "User",
    entityId: targetUserId,
    userId,
    oldValue,
    newValue,
  });
}

export async function logImport(userId: string, importJobId: string, details: unknown) {
  return createAuditLog({
    action: "IMPORT",
    entityType: "ImportJob",
    entityId: importJobId,
    userId,
    newValue: details,
  });
}
