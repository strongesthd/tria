"use client";

import { CalendarDays, Eye, MapPin, MessageCircle } from "lucide-react";
import type { CommunityPost } from "./types";

type UpcomingWorkshop = { id: string; title: string; location: string; startsAt: string; capacity: number; registrations: number };

export function SidebarWidgets({ onOpenEvents, posts, upcomingWorkshop, workshopUnavailable }: { onOpenEvents: () => void; posts: CommunityPost[]; upcomingWorkshop: UpcomingWorkshop | null; workshopUnavailable: boolean }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-2xl border border-[#D97706]/40 bg-[#221D1A] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D97706]">O2O Community</p>
            <h2 className="mt-1 text-lg font-bold text-white">Workshop sắp tới</h2>
          </div>
          <CalendarDays className="h-5 w-5 text-[#D97706]" aria-hidden />
        </div>
        {upcomingWorkshop ? <div className="mt-4 rounded-xl border border-[#4A3B31] p-3">
          <p className="text-sm font-bold text-white">{upcomingWorkshop.title}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-[#B9A99B]"><MapPin className="h-3.5 w-3.5 text-[#D97706]" aria-hidden />{upcomingWorkshop.location}</p>
          <p className="mt-1 text-xs text-[#B9A99B]">{new Date(upcomingWorkshop.startsAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</p>
          <p className="mt-1 text-xs text-[#81746B]">{upcomingWorkshop.registrations}/{upcomingWorkshop.capacity} chỗ đã đăng ký</p>
          <button type="button" onClick={onOpenEvents} className="mt-3 text-xs font-bold text-[#F0B429] hover:underline">Xem thảo luận workshop</button>
        </div> : <p className="mt-4 rounded-xl border border-dashed border-[#4A3B31] p-4 text-sm text-[#81746B]">{workshopUnavailable ? "Không tải được lịch workshop." : "Chưa có workshop sắp diễn ra."}</p>}
      </section>

      <section className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#D97706]" aria-hidden />
          <h2 className="font-bold text-white">Đang được quan tâm</h2>
        </div>
        <ol className="mt-4 space-y-3">
          {posts.map((post, index) => (
            <li key={post.id} className="flex items-start gap-2 text-xs text-[#CDBBAA]">
              <span className="text-[#D97706]">0{index + 1}</span>
              <span className="min-w-0 flex-1">{post.title}<span className="mt-1 flex gap-3 text-[10px] text-[#81746B]"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span><span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span></span></span>
            </li>
          ))}
        </ol>
        {!posts.length && <p className="mt-4 text-xs text-[#81746B]">Chưa có dữ liệu bài viết nổi bật.</p>}
      </section>
    </aside>
  );
}
