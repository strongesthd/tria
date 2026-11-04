import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";
import { rateLimit } from "../../../../../lib/rate-limit";

type Params = Promise<{ productId: string }>;

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(3, "Nhận xét cần ít nhất 3 ký tự.").max(2000, "Nhận xét tối đa 2.000 ký tự."),
});

export async function GET(_request: Request, { params }: { params: Params }) {
  const { productId } = await params;
  const session = await auth();
  const [reviews, aggregate, currentReview] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
      },
    }),
    prisma.productReview.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } }),
    session?.user?.id
      ? prisma.productReview.findUnique({
          where: { productId_authorId: { productId, authorId: session.user.id } },
          select: { id: true, rating: true, content: true },
        })
      : null,
  ]);
  return NextResponse.json({
    reviews,
    total: aggregate._count._all,
    average: Math.round((aggregate._avg.rating || 0) * 10) / 10,
    currentReview,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập để đánh giá sản phẩm." }, { status: 401 });

  const { productId } = await params;
  const limit = rateLimit(`product-review:${session.user.id}`, { limit: 5, windowMs: 5 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: `Bạn gửi quá nhanh. Vui lòng thử lại sau ${limit.retryAfterSeconds}s.` }, { status: 429 });

  const product = await prisma.product.findFirst({ where: { id: productId, active: true }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Sản phẩm không tồn tại." }, { status: 404 });

  const body: unknown = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Đánh giá không hợp lệ." }, { status: 422 });

  const review = await prisma.productReview.upsert({
    where: { productId_authorId: { productId, authorId: session.user.id } },
    create: { productId, authorId: session.user.id, ...parsed.data },
    update: parsed.data,
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      author: { select: { name: true, image: true } },
    },
  });
  const aggregate = await prisma.productReview.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } });
  return NextResponse.json({
    review,
    total: aggregate._count._all,
    average: Math.round((aggregate._avg.rating || 0) * 10) / 10,
  }, { status: 200, headers: { "Cache-Control": "no-store" } });
}