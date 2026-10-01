import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { clientIp, rateLimit } from "../../../../lib/rate-limit";
import { createPostSchema, fieldErrors } from "../../../../lib/validation";

// Never select the full author row: it contains `passwordHash` and `email`.
// Only public profile fields are exposed.
const authorSelect = {
  id: true,
  name: true,
  image: true,
  role: true,
  badge: true,
} as const;

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function GET(request: Request) {
  const limit = rateLimit(`posts:get:${clientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(url.searchParams.get("pageSize") || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
  );
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.trim();
  const sort = url.searchParams.get("sort") || "latest";
  const orderBy = sort === "views"
    ? { views: "desc" as const }
    : sort === "comments"
      ? { comments: { _count: "desc" as const } }
      : sort === "engagement"
        ? { upvotes: "desc" as const }
        : { createdAt: "desc" as const };

  const where = {
    ...(category && category !== "all" ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        category: true,
        tags: true,
        solved: true,
        upvotes: true,
        downvotes: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return NextResponse.json(
    {
      items: posts.map(({ _count, ...post }) => ({ ...post, commentCount: _count.comments })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đăng bài." }, { status: 401 });
  }

  // Rate limit per account, not per IP: prevents point farming via automation.
  const limit = rateLimit(`posts:create:${session.user.id}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Bạn đăng bài quá nhanh. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", fields: fieldErrors(parsed.error) },
      { status: 422 }
    );
  }

  const post = await prisma.communityPost.create({
    data: { ...parsed.data, authorId: session.user.id },
    select: {
      id: true,
      title: true,
      content: true,
      image: true,
      category: true,
      tags: true,
      solved: true,
      upvotes: true,
      downvotes: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: { select: authorSelect },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
