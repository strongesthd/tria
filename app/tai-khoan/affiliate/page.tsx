"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AffiliateData = {
  code: string;
  link: string;
  sales: { id: string; orderId: string; revenue: number; commission: number; status: string; createdAt: string }[];
  summary: { orders: number; revenue: number; commission: number };
};

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/affiliate/me", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Không thể tải dữ liệu affiliate.");
        setData(payload);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu affiliate."));
  }, []);

  if (error) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-red-400">{error}</main>;
  if (!data) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[#A69B93]">Đang tải tài khoản affiliate...</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/san-pham" className="text-sm text-[#E2A168] hover:underline">← Tiếp tục mua hàng</Link>
      <h1 className="mt-5 text-3xl font-extrabold text-white">Affiliate của tôi</h1>
      <p className="mt-2 text-sm text-[#A69B93]">Chia sẻ link này để nhận hoa hồng khi đơn hàng hoàn tất.</p>
      <div className="mt-6 rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Link giới thiệu</p>
        <div className="mt-2 break-all rounded-xl bg-[#221D1A] p-3 text-sm text-[#E8E2D9]">{data.link}</div>
        <p className="mt-2 text-xs text-[#81746B]">Mã affiliate: {data.code}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Đơn hàng", data.summary.orders],
          ["Doanh thu", `${data.summary.revenue.toLocaleString("vi-VN")} VNĐ`],
          ["Hoa hồng dự kiến", `${data.summary.commission.toLocaleString("vi-VN")} VNĐ`],
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5"><p className="text-xs text-[#A69B93]">{label}</p><p className="mt-2 text-xl font-bold text-white">{value}</p></div>)}
      </div>
      <section className="mt-8 overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
        <h2 className="border-b border-[#2A2421] p-5 text-xl font-bold text-white">Đơn hàng từ link của bạn</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#221D1A] text-xs text-[#A69B93]"><tr><th className="p-4">Mã đơn</th><th className="p-4">Doanh thu</th><th className="p-4">Hoa hồng</th><th className="p-4">Trạng thái</th></tr></thead><tbody>{data.sales.map((sale) => <tr key={sale.id} className="border-t border-[#2A2421] text-[#CDBBAA]"><td className="p-4">{sale.orderId}</td><td className="p-4">{sale.revenue.toLocaleString("vi-VN")} VNĐ</td><td className="p-4 text-[#E2A168]">{sale.commission.toLocaleString("vi-VN")} VNĐ</td><td className="p-4">{sale.status}</td></tr>)}</tbody></table>
        </div>
      </section>
    </main>
  );
}
