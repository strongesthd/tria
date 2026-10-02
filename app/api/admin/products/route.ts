import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
  const q = url.searchParams.get("q")?.trim() || "";
  const sort = url.searchParams.get("sort") === "price" ? { price: "desc" as const } : { createdAt: "desc" as const };
  const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }, { category: { contains: q, mode: "insensitive" as const } }] } : {};
  const [total, items] = await Promise.all([prisma.product.count({ where }), prisma.product.findMany({ where, orderBy: sort, skip: (page - 1) * pageSize, take: pageSize })]);
  return NextResponse.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}
