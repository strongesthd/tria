"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { submitBooking, type BookingState } from "../../app/actions/booking";
import { BRANCHES } from "../../lib/site-data";

const initialState: BookingState = {};

export default function BookingForm() {
  const [state, formAction, pending] = useActionState(submitBooking, initialState);

  if (state.success) {
    return (
      <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-[#1C281E] p-6 text-center" role="status">
        <Check className="mx-auto h-10 w-10 text-emerald-400" aria-hidden />
        <h3 className="text-base font-bold text-white">Đăng Ký Thành Công!</h3>
        <p className="text-xs text-[#A69B93]">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Chi Nhánh Trải Nghiệm</span>
          <select name="locationId" defaultValue="loc1" className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]">
            {BRANCHES.map((branch, index) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {index === 0 ? "(Flagship)" : "(Roastery Lab)"}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Mục Đích Hẹn</span>
          <select name="bookingType" defaultValue="b2b_demo" className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]">
            <option value="b2b_demo">Thử máy pha &amp; Hạt sỉ cho Quán/Cty (B2B)</option>
            <option value="b2c_demo">Thử máy pha mini &amp; Hạt lẻ (B2C)</option>
            <option value="cupping">Tham gia Cupping Nếm Vị Hạt Rang</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Họ &amp; Tên</span>
          <input name="name" required maxLength={120} placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Số Điện Thoại</span>
          <input name="phone" type="tel" required maxLength={20} placeholder="0901234567" className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Ngày Dự Kiến Đến</span>
          <input name="date" type="date" required className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Ghi chú (không bắt buộc)</span>
        <textarea name="note" rows={3} maxLength={1000} placeholder="Thiết bị hoặc dòng hạt bạn muốn thử..." className="w-full resize-y rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
      </label>

      {state.error && <p role="alert" className="text-xs text-red-400">{state.error}</p>}

      <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C87D55] py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#A85C38] disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {pending ? "Đang gửi..." : "Xác Nhận Đặt Lịch Hẹn"}
      </button>
    </form>
  );
}