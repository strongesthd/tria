"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "../../lib/site-data";

const WEIGHTS = [
  { value: "250g", priceDelta: 0 },
  { value: "500g", priceDelta: 95000 },
  { value: "1kg", priceDelta: 220000 },
] as const;

const GRINDS = [
  ["whole", "Hạt nguyên (Whole Beans)"],
  ["phin", "Xay pha Phin"],
  ["espresso", "Xay pha Máy / Espresso"],
  ["pourover", "Xay pha Staresso / Pourover"],
] as const;

export default function BeanPurchaseOptions({ product }: { product: Product }) {
  const [weight, setWeight] = useState<(typeof WEIGHTS)[number]["value"]>(product.unit === "1Kg" ? "1kg" : "250g");
  const [grind, setGrind] = useState("whole");
  const selectedWeight = WEIGHTS.find((item) => item.value === weight) ?? WEIGHTS[0];
  const grindLabel = GRINDS.find(([value]) => value === grind)?.[1] ?? GRINDS[0][1];
  const configuredProduct = useMemo<Product>(() => ({
    ...product,
    id: `${product.id}-${weight}-${grind}`,
    name: `${product.name} · ${selectedWeight.value} · ${grindLabel}`,
    price: product.price + selectedWeight.priceDelta,
    unit: selectedWeight.value,
    notes: `${product.notes} · ${grindLabel}`,
  }), [grind, grindLabel, product, selectedWeight.priceDelta, selectedWeight.value, weight]);

  return <div className="space-y-4 rounded-2xl border border-[#2A2421] bg-[#171412] p-5">
    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D97706]">Tuỳ chỉnh đơn hàng</p><h2 className="mt-1 text-lg font-bold text-white">Chọn khối lượng &amp; cỡ xay</h2></div>
    <fieldset><legend className="mb-2 text-xs font-semibold text-[#A69B93]">Khối lượng</legend><div className="grid grid-cols-3 gap-2">{WEIGHTS.map((item) => <button key={item.value} type="button" onClick={() => setWeight(item.value)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${weight === item.value ? "border-[#D97706] bg-[#D97706] text-[#1C1613]" : "border-[#3A302B] text-[#CDBBAA] hover:border-[#D97706]"}`}>{item.value}</button>)}</div></fieldset>
    <label className="block text-xs font-semibold text-[#A69B93]">Cỡ xay<select value={grind} onChange={(event) => setGrind(event.target.value)} className="mt-2 w-full rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]">{GRINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <div className="flex items-center justify-between border-t border-[#2A2421] pt-4"><span className="text-xl font-extrabold text-[#E2A168]">{configuredProduct.price.toLocaleString("vi-VN")} VNĐ</span><div className="w-44"><AddToCartButton product={configuredProduct} /></div></div>
  </div>;
}
