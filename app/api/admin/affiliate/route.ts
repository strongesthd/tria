import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [sales, summary] = await Promise.all([
    prisma.affiliateSale.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderId: true,
        revenue: true,
        commission: true,
        commissionRate: true,
        status: true,
        createdAt: true,
        affiliateUser: { select: { id: true, name: true, email: true, affiliateCode: true } },
      },
    }),
    prisma.affiliateSale.aggregate({
      where: { status: { not: "REJECTED" } },
      _sum: { revenue: true, commission: true },
      _count: { _all: true },
    }),
  ]);
  return NextResponse.json({ sales, summary: { orders: summary._count._all, revenue: summary._sum.revenue || 0, commission: summary._sum.commission || 0 } });
}
