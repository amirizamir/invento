import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  parsePagination,
  paginationMeta,
} from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("audit:read");
    const { page, pageSize, skip } = parsePagination(request.nextUrl.searchParams);
    const entityType = request.nextUrl.searchParams.get("entityType");
    const action = request.nextUrl.searchParams.get("action");
    const userId = request.nextUrl.searchParams.get("userId");

    const where = {
      ...(entityType ? { entityType } : {}),
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiSuccess({ logs, pagination: paginationMeta(total, page, pageSize) });
  } catch (error) {
    return handleApiError(error);
  }
}
