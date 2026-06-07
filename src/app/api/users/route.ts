import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  apiSuccess,
  handleApiError,
  parsePagination,
  paginationMeta,
  ApiError,
} from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { userSchema, userUpdateSchema } from "@/lib/validations";
import { logUserAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("user:read");
    const { page, pageSize, skip } = parsePagination(request.nextUrl.searchParams);
    const search = request.nextUrl.searchParams.get("search") || "";
    const role = request.nextUrl.searchParams.get("role");

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { department: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role ? { role: role as "ADMIN" | "OPERATOR" | "VIEWER" } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess({ users, pagination: paginationMeta(total, page, pageSize) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("user:create");
    const body = await request.json();
    const data = userSchema.parse(body);

    if (!data.password) {
      throw new ApiError(400, "Password is required");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        department: data.department,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logUserAction("CREATE", session.user.id, user.id, undefined, user);

    return apiSuccess(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
