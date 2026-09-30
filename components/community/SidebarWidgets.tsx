"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Eye, MapPin, MessageCircle, Sparkles } from "lucide-react";
import type { CommunityPost } from "./types";

export function SidebarWidgets({ onOpenEvents, posts }: { onOpenEvents: () => void; posts: CommunityPost[] }) {
  const popularPosts = [...posts].sort((a, b) => (b.views + b.comments * 10) - (a.views + a.comments * 10)).slice(0, 3);
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-2xl border border-[#D97706]/40 bg-[#221D1A] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D97706]">O2O Community</p>
            <h2 className="mt-1 text-lg font-bold text-white">Offline tuần này</h2>
          </div>
          <CalendarDays className="h-5 w-5 text-[#D97706]" aria-hidden />
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#4A3B31]">
          <Image
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
            alt="Không gian TRIA Flagship Q.3 tổ chức workshop cupping"
            width={600}
            height={300}
            loading="lazy"
            className="h-28 w-full object-cover"
          />
          <div className="p-3">
            <p className="text-sm font-bold text-white">Cupping Fine Robusta</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#B9A99B]">
              <MapPin className="h-3.5 w-3.5 text-[#D97706]" aria-hidden /> TRIA Flagship Q.3 · Thứ 7, 09:00
            </p>
            <Link
              href="/he-thong-quan#booking"
              onClick={onOpenEvents}
              className="mt-3 flex items-center gap-1 text-xs font-bold text-[#F0B429] hover:underline"
            >
              Đăng ký ngay <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#D97706]" aria-hidden />
          <h2 className="font-bold text-white">Đang được quan tâm</h2>
        </div>
        <ol className="mt-4 space-y-3">
          {popularPosts.map((post, index) => (
            <li key={post.id} className="flex items-start gap-2 text-xs text-[#CDBBAA]">
              <span className="text-[#D97706]">0{index + 1}</span>
              <span className="min-w-0 flex-1">{post.title}<span className="mt-1 flex gap-3 text-[10px] text-[#81746B]"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span><span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span></span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-[#D97706] p-5 text-[#1C1613]">
        <Sparkles aria-hidden className="absolute -right-2 -top-2 h-20 w-20 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-[0.18em]">TRIA Tester Club</p>
        <h2 className="mt-2 text-xl font-bold">Thử hạt mới miễn phí</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#3E2612]">Nhận sample Fine Robusta mới và chia sẻ tasting note cùng cộng đồng.</p>
        <Link href="/he-thong-quan#booking" className="mt-4 inline-block rounded-xl bg-[#1C1613] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#332923]">
          Đăng ký nhận mẫu
        </Link>
      </section>
    </aside>
  );
}
