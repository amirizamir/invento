import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  message: string,
  status = 500,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return apiError(error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return apiError("Validation failed", 400, error.flatten().fieldErrors);
  }

  if (error instanceof Error) {
    return apiError(error.message, 500);
  }

  return apiError("Internal server error", 500);
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultPageSize = 20
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || String(defaultPageSize), 10))
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function paginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNext: page * pageSize < total,
    hasPrev: page > 1,
  };
}
