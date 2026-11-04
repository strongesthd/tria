import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";
import { rateLimit } from "../../../../../lib/rate-limit";

type Params = Promise<{ productId: string }>;

const commentSchema = z.object({
  content: z.string().trim().min(1, "Bình luận không được để trống.").max(5000, "Bình luận quá dài."),
});

export async function GET(_request: Request, { params }: { params: Params }) {
  const { productId } = await params;
  const [comments, total] = await Promise.all([
    prisma.productComment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
      },
    }),
    prisma.productComment.count({ where: { productId } }),
  ]);
  return NextResponse.json({ comments, total }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập để bình luận." }, { status: 401 });

  const { productId } = await params;
  const limit = rateLimit(`product-comment:${session.user.id}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: `Thao tác quá nhanh. Vui lòng thử lại sau ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const product = await prisma.product.findFirst({ where: { id: productId, active: true }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Sản phẩm không tồn tại." }, { status: 404 });

  const body: unknown = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Bình luận không hợp lệ." }, { status: 422 });

  const comment = await prisma.productComment.create({
    data: { content: parsed.data.content, productId, authorId: session.user.id },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { name: true, image: true } },
    },
  });
  return NextResponse.json(comment, { status: 201 });
}
