import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [comments, total] = await Promise.all([
    prisma.productComment.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true,
        author: { select: { name: true, email: true, role: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.productComment.count(),
  ]);

  return NextResponse.json({ comments, total }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN || !session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = z.object({
    parentId: z.string().min(1).max(64),
    content: z.string().trim().min(1, "Nội dung phản hồi không được để trống.").max(5000, "Phản hồi quá dài."),
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Phản hồi không hợp lệ." }, { status: 422 });

  const parent = await prisma.productComment.findFirst({ where: { id: parsed.data.parentId, parentId: null }, select: { id: true, productId: true } });
  if (!parent) return NextResponse.json({ error: "Không tìm thấy bình luận gốc." }, { status: 404 });

  const reply = await prisma.productComment.create({
    data: { content: parsed.data.content, productId: parent.productId, parentId: parent.id, authorId: session.user.id },
    select: {
      id: true,
      content: true,
      parentId: true,
      createdAt: true,
      author: { select: { name: true, email: true, role: true } },
      product: { select: { name: true, slug: true } },
    },
  });
  return NextResponse.json(reply, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = z.object({ id: z.string().min(1).max(64) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bình luận không hợp lệ." }, { status: 422 });
  const result = await prisma.productComment.deleteMany({ where: { id: parsed.data.id } });
  if (!result.count) return NextResponse.json({ error: "Không tìm thấy bình luận." }, { status: 404 });
  return NextResponse.json({ ok: true });
}