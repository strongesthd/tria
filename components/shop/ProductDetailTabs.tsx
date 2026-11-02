"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

type ProductDetailTabsProps = {
  description: string;
  notes: string;
  roastLevel?: string | null;
};

export default function ProductDetailTabs({ description, notes, roastLevel }: ProductDetailTabsProps) {
  const [tab, setTab] = useState<"details" | "comments">("details");

  return (
    <section className="mt-12 border-t border-[#2A2421] pt-6">
      <div className="flex gap-6 border-b border-[#2A2421]" role="tablist" aria-label="Thông tin sản phẩm">
        <button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "details" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Chi tiết sản phẩm
        </button>
        <button type="button" role="tab" aria-selected={tab === "comments"} onClick={() => setTab("comments")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "comments" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Bình luận ({0})
        </button>
      </div>

      {tab === "details" ? (
        <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="cms-rich-editor text-sm leading-7 text-[#D8CDC2]" dangerouslySetInnerHTML={{ __html: description }} />
          <div className="h-fit rounded-2xl border border-[#2A2421] bg-[#171412] p-5 text-sm">
            <h2 className="flex items-center gap-2 font-bold text-white">Đặc tính nổi bật</h2>
            <div className="cms-rich-editor mt-3 text-[#D8CDC2]" dangerouslySetInnerHTML={{ __html: notes || "<p>Đang cập nhật</p>" }} />
            {roastLevel && <p className="mt-3 text-xs text-[#A69B93]">Mức rang: {roastLevel}</p>}
          </div>
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center py-10 text-center">
          <MessageCircle className="h-8 w-8 text-[#D97706]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-white">Chưa có bình luận nào</p>
          <p className="mt-1 text-xs text-[#81746B]">Hãy đăng nhập để chia sẻ đánh giá về sản phẩm.</p>
        </div>
      )}
    </section>
  );
}
