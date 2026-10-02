import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, products, branches, bookings, orders, messages, leads, posts, recentOrders, recentBookings, recentMessages] = await Promise.all([
    prisma.user.count(), prisma.product.count({ where: { active: true } }), prisma.branch.count({ where: { active: true } }),
    prisma.booking.count(), prisma.order.count(), prisma.contactMessage.count({ where: { status: "NEW" } }), prisma.partnershipLead.count({ where: { status: "NEW" } }), prisma.communityPost.count(),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, name: true, total: true, status: true, createdAt: true, user: { select: { email: true } } } }),
    prisma.booking.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, locationId: true, type: true, date: true, user: { select: { name: true, email: true } } } }),
    prisma.contactMessage.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, name: true, subject: true, status: true, createdAt: true } }),
  ]);
  return NextResponse.json({ stats: { users, products, branches, bookings, orders, messages, leads, posts }, recentOrders, recentBookings, recentMessages });
}
