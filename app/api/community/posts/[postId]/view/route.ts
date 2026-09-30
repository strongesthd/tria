import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { clientIp, rateLimit } from "../../../../../../lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const limit = rateLimit(`view:${clientIp(request)}:${postId}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.ok) return NextResponse.json({ ok: true, counted: false });
  const post = await prisma.communityPost.updateMany({ where: { id: postId }, data: { views: { increment: 1 } } });
  return NextResponse.json({ ok: true, counted: post.count > 0 });
}
