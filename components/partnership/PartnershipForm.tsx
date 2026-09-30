"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const initialForm = { fullName: "", phone: "", partnershipType: "location", location: "", notes: "" };

export default function PartnershipForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [pending, setPending] = useState(false);

  const update = (key: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus({ type: "idle" });
    try {
      const response = await fetch("/api/partnership", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể gửi đăng ký. Vui lòng thử lại.");
      setStatus({ type: "success", message: "Đã nhận đăng ký. TRIA sẽ liên hệ bạn trong thời gian sớm nhất." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Đã xảy ra lỗi." });
    } finally {
      setPending(false);
    }
  }

  if (status.type === "success") return <div role="status" className="rounded-2xl border border-emerald-500/30 bg-[#14251A] p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" /><h3 className="mt-4 text-xl font-bold text-white">Cảm ơn bạn đã quan tâm</h3><p className="mt-2 text-sm text-[#CDBBAA]">{status.message}</p><button type="button" onClick={() => setStatus({ type: "idle" })} className="mt-6 text-sm font-bold text-[#F0B429] hover:underline">Gửi thêm đăng ký</button></div>;

  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#3A302B] bg-[#171412] p-6 sm:p-8">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-[#E8E2D9]">Họ và tên<input required maxLength={120} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-2 w-full rounded-xl border border-[#4A3B31] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]" placeholder="Nguyễn Văn A" /></label>
      <label className="block text-sm font-semibold text-[#E8E2D9]">Số điện thoại / Zalo<input required type="tel" maxLength={20} value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-2 w-full rounded-xl border border-[#4A3B31] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]" placeholder="0989 668 113" /></label>
    </div>
    <label className="block text-sm font-semibold text-[#E8E2D9]">Mô hình hợp tác<select value={form.partnershipType} onChange={(e) => update("partnershipType", e.target.value)} className="mt-2 w-full rounded-xl border border-[#4A3B31] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]"><option value="location">Có sẵn mặt bằng (Chỉ hợp tác địa điểm)</option><option value="franchise">Muốn đầu tư xe/máy (Nhượng quyền)</option></select></label>
    <label className="block text-sm font-semibold text-[#E8E2D9]">Địa chỉ / Thành phố<input required maxLength={300} value={form.location} onChange={(e) => update("location", e.target.value)} className="mt-2 w-full rounded-xl border border-[#4A3B31] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]" placeholder="Quận, thành phố hoặc địa chỉ mặt bằng" /></label>
    <label className="block text-sm font-semibold text-[#E8E2D9]">Ghi chú / Lời nhắn<textarea rows={4} maxLength={2000} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-[#4A3B31] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]" placeholder="Diện tích, lưu lượng khách, thời gian dự kiến..." /></label>
    {status.type === "error" && <p role="alert" className="text-sm text-red-400">{status.message}</p>}
    <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] py-3.5 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E] disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{pending ? "Đang gửi..." : "Đăng ký hợp tác"}</button>
  </form>;
}
