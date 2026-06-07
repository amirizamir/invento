import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
      return apiSuccess({ updated: "all" });
    }

    if (id) {
      await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true },
      });
      return apiSuccess({ updated: id });
    }

    const { ApiError } = await import("@/lib/api-utils");
    throw new ApiError(400, "Invalid request");
  } catch (error) {
    return handleApiError(error);
  }
}
