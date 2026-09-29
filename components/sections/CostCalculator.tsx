"use client";

import { useMemo, useState } from "react";

/**
 * Cost-per-cup calculator. Pure client math without server roundtrips.
 */
export default function CostCalculator() {
  const [cupsPerDay, setCupsPerDay] = useState(150);
  const [beanCostPerKg, setBeanCostPerKg] = useState(320000);
  const [gramPerCup, setGramPerCup] = useState(14);
  const [sellingPrice, setSellingPrice] = useState(25000);

  const coffeeCostPerCup = useMemo(() => (beanCostPerKg / 1000) * gramPerCup, [beanCostPerKg, gramPerCup]);
  const totalCostPerCup = coffeeCostPerCup + 3000;
  const dailyProfit = (sellingPrice - totalCostPerCup) * cupsPerDay;
  const monthlyProfit = dailyProfit * 30;

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
      <div className="space-y-6 rounded-2xl border border-[#2A2421] bg-[#171412] p-6 lg:col-span-6">
        <h2 className="border-b border-[#2A2421] pb-3 text-lg font-bold text-white">Thông Số Đầu Vào Quán Cà Phê</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 flex justify-between text-xs text-[#A69B93]">
              <span>Sản lượng tiêu thụ dự kiến:</span>
              <span className="font-bold text-[#E2A168]">{cupsPerDay} ly/ngày</span>
            </span>
            <input type="range" min={30} max={500} value={cupsPerDay} onChange={(e) => setCupsPerDay(Number(e.target.value))} className="w-full accent-[#C87D55]" />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Giá Hạt Cà Phê Rang (VNĐ/Kg)</span>
            <input type="number" min={0} value={beanCostPerKg} onChange={(e) => setBeanCostPerKg(Number(e.target.value))} className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Định lượng hạt / ly (Gram)</span>
              <input type="number" min={1} value={gramPerCup} onChange={(e) => setGramPerCup(Number(e.target.value))} className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#A69B93]">Giá bán dự kiến / ly (VNĐ)</span>
              <input type="number" min={0} value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="w-full rounded-xl border border-[#332A25] bg-[#221D1A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C87D55]" />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-[#3A302B] bg-gradient-to-br from-[#221D1A] to-[#171412] p-6 lg:col-span-6">
        <h2 className="border-b border-[#2A2421] pb-3 text-lg font-bold text-white">Kết Quả Phân Tích Chi Phí &amp; Lợi Nhuận</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#2A2421] bg-[#171412] p-4">
            <span className="block text-[10px] font-semibold uppercase text-[#A69B93]">Cost Hạt / Ly</span>
            <span className="text-xl font-extrabold text-[#E2A168]">{Math.round(coffeeCostPerCup).toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div className="rounded-xl border border-[#2A2421] bg-[#171412] p-4">
            <span className="block text-[10px] font-semibold uppercase text-[#A69B93]">Tổng Cost / Ly (Gồm ly/sữa)</span>
            <span className="text-xl font-extrabold text-amber-400">{Math.round(totalCostPerCup).toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A69B93]">Lợi nhuận gộp / Ngày:</span>
            <span className="font-bold text-white">{Math.round(dailyProfit).toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#2A2421] pt-2 text-base">
            <span className="font-bold text-white">Lợi nhuận gộp Dự kiến / Tháng:</span>
            <span className="text-2xl font-extrabold text-[#C87D55]">{Math.round(monthlyProfit).toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>
        <p className="text-[11px] italic leading-relaxed text-[#A69B93]">
          * Ghi chú: Công cụ này tính toán dựa trên Cost nguyên liệu trực tiếp. Chưa bao gồm chi phí mặt bằng và nhân sự cố định.
        </p>
      </div>
    </div>
  );
}