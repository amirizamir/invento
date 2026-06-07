import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { requirePermission } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("vm:read");
    const ip = getClientIp(request);
    const limit = rateLimit(`dashboard:${session.user.id}:${ip}`);
    if (!limit.success) {
      return handleApiError(new Error("Rate limit exceeded"));
    }

    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVMs,
      activeVMs,
      inactiveVMs,
      criticalVMs,
      missingBackups,
      missingMonitoring,
      nearEOL,
      recentlyAdded,
      platformDistribution,
      osDistribution,
      departmentDistribution,
      statusBreakdown,
      growthTrend,
      resourceTotals,
      cpuDistribution,
      memoryDistribution,
      storageDistribution,
      recentActivity,
    ] = await Promise.all([
      prisma.virtualMachine.count(),
      prisma.virtualMachine.count({ where: { status: "ACTIVE" } }),
      prisma.virtualMachine.count({ where: { status: "INACTIVE" } }),
      prisma.virtualMachine.count({ where: { criticality: "CRITICAL" } }),
      prisma.virtualMachine.count({ where: { backupEnabled: false, status: { not: "DECOMMISSIONED" } } }),
      prisma.virtualMachine.count({ where: { monitoringEnabled: false, status: { not: "DECOMMISSIONED" } } }),
      prisma.virtualMachine.count({
        where: {
          endOfLifeDate: { lte: ninetyDaysFromNow, gte: now },
          status: { not: "DECOMMISSIONED" },
        },
      }),
      prisma.virtualMachine.count({ where: { createdDate: { gte: thirtyDaysAgo } } }),
      prisma.virtualMachine.groupBy({ by: ["platform"], _count: { id: true } }),
      prisma.virtualMachine.groupBy({ by: ["osType"], _count: { id: true }, where: { osType: { not: null } } }),
      prisma.virtualMachine.groupBy({ by: ["department"], _count: { id: true }, where: { department: { not: null } } }),
      prisma.virtualMachine.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT TO_CHAR("createdDate", 'YYYY-MM') as month, COUNT(*)::bigint as count
        FROM "VirtualMachine"
        GROUP BY TO_CHAR("createdDate", 'YYYY-MM')
        ORDER BY month ASC
      `,
      prisma.virtualMachine.aggregate({
        _sum: { cpuCores: true, memoryGB: true, storageGB: true },
        _avg: { cpuCores: true, memoryGB: true, storageGB: true },
      }),
      prisma.virtualMachine.groupBy({
        by: ["cpuCores"],
        _count: { id: true },
        orderBy: { cpuCores: "asc" },
      }),
      prisma.virtualMachine.groupBy({
        by: ["memoryGB"],
        _count: { id: true },
        orderBy: { memoryGB: "asc" },
      }),
      prisma.virtualMachine.groupBy({
        by: ["storageGB"],
        _count: { id: true },
        orderBy: { storageGB: "asc" },
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return apiSuccess({
      summary: {
        totalVMs,
        activeVMs,
        inactiveVMs,
        criticalVMs,
        missingBackups,
        missingMonitoring,
        nearEOL,
        recentlyAdded,
      },
      charts: {
        platformDistribution: platformDistribution.map((p) => ({
          name: p.platform,
          value: p._count.id,
        })),
        osDistribution: osDistribution.map((o) => ({
          name: o.osType || "Unknown",
          value: o._count.id,
        })),
        departmentDistribution: departmentDistribution.map((d) => ({
          name: d.department || "Unknown",
          value: d._count.id,
        })),
        statusBreakdown: statusBreakdown.map((s) => ({
          name: s.status,
          value: s._count.id,
        })),
        growthTrend: growthTrend.map((g) => ({
          month: g.month,
          count: Number(g.count),
        })),
        resourceTotals: {
          totalCpu: resourceTotals._sum.cpuCores || 0,
          totalMemory: resourceTotals._sum.memoryGB || 0,
          totalStorage: resourceTotals._sum.storageGB || 0,
          avgCpu: Math.round((resourceTotals._avg.cpuCores || 0) * 10) / 10,
          avgMemory: Math.round((resourceTotals._avg.memoryGB || 0) * 10) / 10,
          avgStorage: Math.round((resourceTotals._avg.storageGB || 0) * 10) / 10,
        },
        cpuDistribution: cpuDistribution.map((c) => ({
          name: `${c.cpuCores} cores`,
          value: c._count.id,
        })),
        memoryDistribution: memoryDistribution.map((m) => ({
          name: `${m.memoryGB} GB`,
          value: m._count.id,
        })),
        storageDistribution: storageDistribution.map((s) => ({
          name: `${s.storageGB} GB`,
          value: s._count.id,
        })),
      },
      recentActivity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
