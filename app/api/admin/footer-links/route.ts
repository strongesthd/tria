import { FooterLinkSection, Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const PAGE_SIZE = 20;
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const requestedPage = Number(url.searchParams.get("page") || 1);
  const requestedPageNumber =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const query = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const rawSection = url.searchParams.get("section");
  if (rawSection && !Object.values(FooterLinkSection).includes(rawSection as FooterLinkSection)) {
    return NextResponse.json({ error: "Nhóm liên kết không hợp lệ." }, { status: 400 });
  }

  const where: Prisma.FooterLinkWhereInput = {
    ...(rawSection ? { section: rawSection as FooterLinkSection } : {}),
    ...(query
      ? {
          OR: [
            { label: { contains: query, mode: "insensitive" } },
            { href: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const total = await prisma.footerLink.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPageNumber, totalPages);
  const items = await prisma.footerLink.findMany({
    where,
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, section: true, label: true, href: true, sortOrder: true, active: true },
  });

  return NextResponse.json({
    items,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
  });
}
