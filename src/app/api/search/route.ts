import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const q = request.nextUrl.searchParams.get("q") || "";

    if (q.length < 2) {
      return apiSuccess({ results: [] });
    }

    const vms = await prisma.virtualMachine.findMany({
      where: {
        OR: [
          { hostname: { contains: q, mode: "insensitive" } },
          { vmName: { contains: q, mode: "insensitive" } },
          { application: { contains: q, mode: "insensitive" } },
          { owner: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
          { datacenter: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      take: 10,
      select: {
        id: true,
        hostname: true,
        vmName: true,
        platform: true,
        environment: true,
        status: true,
      },
    });

    return apiSuccess({
      results: vms.map((vm) => ({
        type: "vm" as const,
        id: vm.id,
        title: vm.vmName,
        subtitle: `${vm.hostname} · ${vm.platform} · ${vm.environment}`,
        href: `/vms/${vm.id}`,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
