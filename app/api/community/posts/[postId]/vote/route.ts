import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../lib/prisma";
import { rateLimit } from "../../../../../../lib/rate-limit";
import { voteSchema } from "../../../../../../lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập để bình chọn." }, { status: 401 });
  const { postId } = await params;
  const limit = rateLimit(`vote:${session.user.id}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Bạn bình chọn quá nhanh." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const parsed = voteSchema.safeParse({ ...(body as object), postId });
  if (!parsed.success) return NextResponse.json({ error: "Bình chọn không hợp lệ." }, { status: 422 });
  const direction = parsed.data.direction === "up" ? 1 : -1;
  const existing = await prisma.postVote.findUnique({ where: { postId_userId: { postId, userId: session.user.id } }, select: { direction: true } });
  if (existing?.direction === direction) {
    await prisma.$transaction([
      prisma.postVote.delete({ where: { postId_userId: { postId, userId: session.user.id } } }),
      prisma.communityPost.update({ where: { id: postId }, data: direction === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ voted: false, direction: null });
  }
  if (existing) {
    await prisma.$transaction([
      prisma.postVote.update({ where: { postId_userId: { postId, userId: session.user.id } }, data: { direction } }),
      prisma.communityPost.update({ where: { id: postId }, data: direction === 1 ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.postVote.create({ data: { postId, userId: session.user.id, direction } }),
      prisma.communityPost.update({ where: { id: postId }, data: direction === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } } }),
    ]);
  }
  return NextResponse.json({ voted: true, direction: parsed.data.direction });
}
