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
import { hardwareQuerySchema } from "@/lib/hardware-validations";
import { toHardwareCreateData } from "@/lib/hardware-data";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("hardware:read");
    const ip = getClientIp(request);
    const limit = rateLimit(`hardware:${session.user.id}:${ip}`);
    if (!limit.success) {
      return handleApiError(new Error("Rate limit exceeded"));
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = hardwareQuerySchema.parse(params);
    const { page, pageSize, skip } = parsePagination(request.nextUrl.searchParams, query.pageSize);

    const where: Prisma.HardwareEquipmentWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { assetId: { contains: query.search, mode: "insensitive" } },
        { serialNumber: { contains: query.search, mode: "insensitive" } },
        { model: { contains: query.search, mode: "insensitive" } },
        { hostname: { contains: query.search, mode: "insensitive" } },
        { managementIp: { contains: query.search, mode: "insensitive" } },
        { owner: { contains: query.search, mode: "insensitive" } },
        { department: { contains: query.search, mode: "insensitive" } },
        { rack: { contains: query.search, mode: "insensitive" } },
        { tags: { has: query.search } },
      ];
    }

    if (query.category) where.category = query.category;
    if (query.manufacturer) where.manufacturer = query.manufacturer;
    if (query.status) where.status = query.status;
    if (query.criticality) where.criticality = query.criticality;
    if (query.environment) where.environment = query.environment;
    if (query.department) where.department = { contains: query.department, mode: "insensitive" };

    const sortBy = query.sortBy || "updatedDate";
    const sortOrder = query.sortOrder || "desc";

    const [hardware, total] = await Promise.all([
      prisma.hardwareEquipment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.hardwareEquipment.count({ where }),
    ]);

    return apiSuccess({
      hardware,
      pagination: paginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("hardware:create");
    const body = await request.json();
    const { hardwareSchema } = await import("@/lib/hardware-validations");
    const { logHardwareCreate } = await import("@/lib/audit");

    const data = hardwareSchema.parse(body);

    const item = await prisma.hardwareEquipment.create({
      data: toHardwareCreateData(data, session.user.name ?? undefined),
    });

    await logHardwareCreate(session.user.id, item, item.id);

    return apiSuccess(item, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
