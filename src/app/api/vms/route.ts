import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  apiSuccess,
  handleApiError,
  parsePagination,
  paginationMeta,
} from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { vmQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("vm:read");
    const ip = getClientIp(request);
    const limit = rateLimit(`vms:${session.user.id}:${ip}`);
    if (!limit.success) {
      return handleApiError(new Error("Rate limit exceeded"));
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = vmQuerySchema.parse(params);
    const { page, pageSize, skip } = parsePagination(request.nextUrl.searchParams, query.pageSize);

    const where: Prisma.VirtualMachineWhereInput = {};

    if (query.search) {
      where.OR = [
        { hostname: { contains: query.search, mode: "insensitive" } },
        { vmName: { contains: query.search, mode: "insensitive" } },
        { ipAddress: { contains: query.search, mode: "insensitive" } },
        { owner: { contains: query.search, mode: "insensitive" } },
        { department: { contains: query.search, mode: "insensitive" } },
        { application: { contains: query.search, mode: "insensitive" } },
        { datacenter: { contains: query.search, mode: "insensitive" } },
        { tags: { has: query.search } },
      ];
    }

    if (query.platform) where.platform = query.platform;
    if (query.environment) where.environment = query.environment;
    if (query.status) where.status = query.status;
    if (query.criticality) where.criticality = query.criticality;
    if (query.department) where.department = { contains: query.department, mode: "insensitive" };
    if (query.powerState) where.powerState = query.powerState;

    const sortBy = query.sortBy || "updatedDate";
    const sortOrder = query.sortOrder || "desc";

    const [vms, total] = await Promise.all([
      prisma.virtualMachine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.virtualMachine.count({ where }),
    ]);

    return apiSuccess({
      vms,
      pagination: paginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("vm:create");
    const body = await request.json();
    const { vmSchema } = await import("@/lib/validations");
    const { logVMCreate } = await import("@/lib/audit");

    const data = vmSchema.parse(body);

    const vm = await prisma.virtualMachine.create({
      data: {
        ...data,
        ipAddress: data.ipAddress || null,
      },
    });

    await logVMCreate(session.user.id, vm, vm.id);

    return apiSuccess(vm, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
