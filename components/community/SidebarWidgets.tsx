"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Crown, MapPin, Sparkles, Wrench } from "lucide-react";

const LEADERBOARD: [string, string, string][] = [
  ["Hoàng Barista", "1,280", "🥇"],
  ["Minh Đức", "980", "💼"],
  ["Kỹ thuật viên Tuấn", "860", "🛠️"],
];

const HOT_TOPICS: [string, string][] = [
  ["Máy tụt áp giữa shot", "31"],
  ["Vệ sinh group head", "22"],
  ["Cost ly Latte", "18"],
];

export function SidebarWidgets({ onOpenEvents }: { onOpenEvents: () => void }) {
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
          <Crown className="h-5 w-5 text-[#F0B429]" aria-hidden />
          <h2 className="font-bold text-white">Bảng vàng tháng 9</h2>
        </div>
        <ol className="mt-4 space-y-3">
          {LEADERBOARD.map(([name, points, badge], index) => (
            <li key={name} className="flex items-center gap-3">
              <span className="w-4 text-xs text-[#81746B]">0{index + 1}</span>
              <span aria-hidden className="text-lg">{badge}</span>
              <span className="flex-1 text-sm font-semibold text-[#E8E2D9]">{name}</span>
              <span className="text-xs font-bold text-[#D97706]">{points} pts</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-[#2A2421] pt-3 text-xs text-[#A69B93]">Điểm dùng đổi hạt và phụ kiện tại TRIA.</p>
      </section>

      <section className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#D97706]" aria-hidden />
          <h2 className="font-bold text-white">Hot topics</h2>
        </div>
        <ol className="mt-4 space-y-3 text-sm">
          {HOT_TOPICS.map(([topic, count], index) => (
            <li key={topic} className="flex items-start gap-2 text-[#CDBBAA]">
              <span className="text-[#D97706]">0{index + 1}</span> {topic}
              <span className="ml-auto text-xs text-[#81746B]">{count}</span>
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
