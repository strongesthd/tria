import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

async function queryOrFallback<T>(label: string, query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query;
  } catch (error) {
    console.error(`[admin-dashboard] Could not load ${label}.`, error);
    return fallback;
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, products, branches, bookings, orders, messages, leads, posts, recentOrders, recentBookings, recentMessages, recentLeads] = await Promise.all([
    queryOrFallback("users", prisma.user.count(), 0),
    queryOrFallback("products", prisma.product.count({ where: { active: true } }), 0),
    queryOrFallback("branches", prisma.branch.count({ where: { active: true } }), 0),
    queryOrFallback("bookings", prisma.booking.count(), 0),
    queryOrFallback("orders", prisma.order.count(), 0),
    queryOrFallback("messages", prisma.contactMessage.count({ where: { status: "NEW" } }), 0),
    queryOrFallback("leads", prisma.partnershipLead.count({ where: { status: "NEW" } }), 0),
    queryOrFallback("posts", prisma.communityPost.count(), 0),
    queryOrFallback("recent orders", prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, name: true, total: true, status: true, createdAt: true, user: { select: { email: true } } } }), []),
    queryOrFallback("recent bookings", prisma.booking.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, locationId: true, type: true, date: true, note: true, user: { select: { name: true, email: true } } } }), []),
    queryOrFallback("recent messages", prisma.contactMessage.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, name: true, subject: true, status: true, createdAt: true } }), []),
    queryOrFallback("recent leads", prisma.partnershipLead.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, fullName: true, phone: true, partnershipType: true, location: true, status: true, notes: true, createdAt: true } }), []),
  ]);
  return NextResponse.json({ stats: { users, products, branches, bookings, orders, messages, leads, posts }, recentOrders, recentBookings, recentMessages, recentLeads });
}
