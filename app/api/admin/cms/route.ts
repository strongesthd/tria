import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const type = new URL(request.url).searchParams.get("type");
  const id = new URL(request.url).searchParams.get("id");
  if (type === "pages") {
    if (id) {
      const item = await prisma.cmsPage.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ error: "Không tìm thấy trang." }, { status: 404 });
      return NextResponse.json({ item });
    }
    const items = await prisma.cmsPage.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
      select: { id: true, slug: true, title: true, footerSection: true, sortOrder: true, published: true, updatedAt: true },
    });
    return NextResponse.json({ items });
  }
  if (type === "articles") {
    if (id) {
      const item = await prisma.newsArticle.findUnique({ where: { id } });
      if (!item) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
      return NextResponse.json({ item });
    }
    const items = await prisma.newsArticle.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
      select: { id: true, slug: true, title: true, published: true, publishedAt: true, updatedAt: true },
    });
    return NextResponse.json({ items });
  }
  return NextResponse.json({ error: "Loại nội dung không hợp lệ." }, { status: 400 });
}
