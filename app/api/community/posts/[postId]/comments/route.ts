import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../lib/prisma";
import { clientIp, rateLimit } from "../../../../../../lib/rate-limit";
import { createCommentSchema, fieldErrors } from "../../../../../../lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: [{ parentId: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      content: true,
      accepted: true,
      createdAt: true,
      parentId: true,
      author: { select: { id: true, name: true, image: true, badge: true, role: true } },
    },
  });
  return NextResponse.json(comments, { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập để bình luận." }, { status: 401 });
  const { postId } = await params;
  const limit = rateLimit(`comment:${clientIp(request)}:${session.user.id}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Bạn bình luận quá nhanh." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const parsed = createCommentSchema.safeParse({ ...(body as object), postId });
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ.", fields: fieldErrors(parsed.error) }, { status: 422 });

  const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Bài viết không tồn tại." }, { status: 404 });
  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId }, select: { postId: true } });
    if (!parent || parent.postId !== postId) return NextResponse.json({ error: "Bình luận cha không hợp lệ." }, { status: 422 });
  }

  const comment = await prisma.comment.create({
    data: { content: parsed.data.content, postId, parentId: parsed.data.parentId, authorId: session.user.id },
    select: { id: true, content: true, accepted: true, parentId: true, createdAt: true, author: { select: { id: true, name: true, image: true, badge: true, role: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
