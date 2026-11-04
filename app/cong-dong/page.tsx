import { Metadata } from "next";
import { MessageSquare, Users, BookOpen } from "lucide-react";
import { Role } from "@prisma/client";
import { JsonLdScript } from "../../components/seo/JsonLdScript";
import CommunityHub from "../../components/community/CommunityHub";
import { buildBreadcrumbJsonLd } from "../../lib/site-data";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = {
  title: "TRIA Community - Cộng đồng cà phê Việt",
  description:
    "Nơi Home Barista, chủ quán và đội ngũ kỹ thuật TRIA học, thử và chia sẻ kinh nghiệm pha chế, bảo dưỡng máy và quản lý quán cà phê.",
  keywords: ["cộng đồng cà phê", "home barista", "quản lý quán cà phê", "bảo dưỡng máy pha", "TRIA Lab"],
  alternates: { canonical: "/cong-dong" },
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  let workshopUnavailable = false;
  const [memberCount, postCount, workshop] = await Promise.all([
    prisma.user.count({ where: { role: { not: Role.ADMIN } } }).catch(() => null),
    prisma.communityPost.count({ where: { published: true } }).catch(() => null),
    prisma.workshop.findFirst({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        title: true,
        locationId: true,
        startsAt: true,
        capacity: true,
        _count: { select: { registrations: true } },
      },
    }).catch(() => { workshopUnavailable = true; return null; }),
  ]);
  const workshopLocation = workshop
    ? await prisma.branch.findFirst({ where: { OR: [{ id: workshop.locationId }, { slug: workshop.locationId }] }, select: { name: true } }).catch(() => null)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Trang chủ", href: "/" },
          { name: "Cộng đồng", href: "/cong-dong" },
        ])}
      />

      <header className="mb-8 rounded-3xl border border-[#2A2421] bg-[#0F0D0C] p-4 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#D97706]">
              <MessageSquare className="h-5 w-5" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-[0.22em]">TRIA Community &amp; Knowledge Hub</span>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Nơi người yêu cà phê <span className="text-[#D97706]">học, thử và chia sẻ.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A69B93]">
              Kết nối Home Barista, chủ quán và đội ngũ kỹ thuật TRIA trong một hub tri thức gắn với hai flagship store tại TP.HCM.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <div className="rounded-xl border border-[#3A302B] bg-[#171412] px-4 py-3">
              <Users className="h-4 w-4 text-[#D97706]" aria-hidden />
              <p className="mt-1 text-lg font-bold text-white">{memberCount?.toLocaleString("vi-VN") ?? "—"}</p>
              <p className="text-[10px] text-[#A69B93]">thành viên</p>
            </div>
            <div className="rounded-xl border border-[#3A302B] bg-[#171412] px-4 py-3">
              <BookOpen className="h-4 w-4 text-[#D97706]" aria-hidden />
              <p className="mt-1 text-lg font-bold text-white">{postCount?.toLocaleString("vi-VN") ?? "—"}</p>
              <p className="text-[10px] text-[#A69B93]">bài chuyên môn</p>
            </div>
          </div>
        </div>
      </header>

      <CommunityHub upcomingWorkshop={workshop ? {
        id: workshop.id,
        title: workshop.title,
        location: workshopLocation?.name || workshop.locationId,
        startsAt: workshop.startsAt.toISOString(),
        capacity: workshop.capacity,
        registrations: workshop._count.registrations,
      } : null} workshopUnavailable={workshopUnavailable} />
    </div>
  );
}
