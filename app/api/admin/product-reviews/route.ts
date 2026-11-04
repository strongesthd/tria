import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({
      take: 100,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        rating: true,
        content: true,
        updatedAt: true,
        author: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    }),
    prisma.productReview.count(),
  ]);
  return NextResponse.json({ reviews, total }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = z.object({ id: z.string().min(1).max(64) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Đánh giá không hợp lệ." }, { status: 422 });
  await prisma.productReview.deleteMany({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}