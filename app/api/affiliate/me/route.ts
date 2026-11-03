import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { ensureAffiliateCode, getAffiliateLink } from "../../../../lib/affiliate";
import { prisma } from "../../../../lib/prisma";
import { SITE_URL } from "../../../../lib/site-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const code = await ensureAffiliateCode(session.user.id, session.user.name);
  const [sales, summary] = await Promise.all([
    prisma.affiliateSale.findMany({
      where: { affiliateUserId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, orderId: true, revenue: true, commission: true, status: true, createdAt: true },
    }),
    prisma.affiliateSale.aggregate({
      where: { affiliateUserId: session.user.id, status: { not: "REJECTED" } },
      _sum: { revenue: true, commission: true },
      _count: { _all: true },
    }),
  ]);
  return NextResponse.json({
    code,
    link: new URL(getAffiliateLink(code), SITE_URL).toString(),
    sales,
    summary: {
      orders: summary._count._all,
      revenue: summary._sum.revenue || 0,
      commission: summary._sum.commission || 0,
    },
  });
}
