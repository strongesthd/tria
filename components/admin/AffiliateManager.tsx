"use client";

import { useEffect, useState } from "react";

type AffiliateSale = {
  id: string;
  orderId: string;
  revenue: number;
  commission: number;
  commissionRate: number;
  status: string;
  createdAt: string;
  affiliateUser: { id: string; name: string | null; email: string | null; affiliateCode: string | null };
};

type AffiliateData = {
  sales: AffiliateSale[];
  summary: { orders: number; revenue: number; commission: number };
};

export default function AffiliateManager() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/affiliate", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Không thể tải báo cáo affiliate.");
        setData(payload);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải báo cáo affiliate."));
  }, []);

  if (error) return <p role="alert" className="rounded-2xl border border-red-900/50 bg-red-950/30 p-5 text-sm text-red-300">{error}</p>;
  if (!data) return <p className="rounded-2xl border border-[#3A302B] bg-[#171412] p-8 text-sm text-[#A69B93]">Đang tải báo cáo affiliate...</p>;

  return <section className="space-y-6">
    <div><h2 className="text-xl font-bold text-white">Affiliate &amp; doanh thu</h2><p className="mt-1 text-sm text-[#A69B93]">Theo dõi đơn hàng phát sinh từ link giới thiệu và hoa hồng.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ["Đơn affiliate", data.summary.orders],
        ["Doanh thu", `${data.summary.revenue.toLocaleString("vi-VN")} VNĐ`],
        ["Hoa hồng", `${data.summary.commission.toLocaleString("vi-VN")} VNĐ`],
      ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5"><p className="text-xs text-[#A69B93]">{label}</p><p className="mt-2 text-2xl font-extrabold text-white">{value}</p></div>)}
    </div>
    <div className="overflow-x-auto rounded-2xl border border-[#3A302B] bg-[#171412]"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#221D1A] text-xs uppercase text-[#A69B93]"><tr><th className="p-4">Affiliate</th><th className="p-4">Mã đơn</th><th className="p-4">Doanh thu</th><th className="p-4">Tỷ lệ</th><th className="p-4">Hoa hồng</th><th className="p-4">Trạng thái</th></tr></thead><tbody>{data.sales.map((sale) => <tr key={sale.id} className="border-t border-[#2A2421] text-[#CDBBAA]"><td className="p-4"><strong className="text-white">{sale.affiliateUser.name || "Chưa đặt tên"}</strong><span className="block text-xs text-[#81746B]">{sale.affiliateUser.email} · {sale.affiliateUser.affiliateCode}</span></td><td className="p-4">{sale.orderId}</td><td className="p-4">{sale.revenue.toLocaleString("vi-VN")} VNĐ</td><td className="p-4">{sale.commissionRate}%</td><td className="p-4 text-[#E2A168]">{sale.commission.toLocaleString("vi-VN")} VNĐ</td><td className="p-4">{sale.status}</td></tr>)}</tbody></table></div>
  </section>;
}
