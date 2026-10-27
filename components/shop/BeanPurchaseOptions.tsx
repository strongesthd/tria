"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "../../lib/site-data";
import { getBeanPriceOptions } from "../../lib/product-pricing";

const GRINDS = [
  ["whole", "Hạt nguyên (Whole Beans)"],
  ["phin", "Xay pha Phin"],
  ["espresso", "Xay pha Máy / Espresso"],
  ["pourover", "Xay pha Staresso / Pourover"],
] as const;

export default function BeanPurchaseOptions({ product }: { product: Product }) {
  const options = getBeanPriceOptions(product.price, product.priceOptions);
  const initialOption = options.find((option) => option.unit.toLowerCase() === product.unit.toLowerCase()) ?? options[0];
  const [weight, setWeight] = useState(initialOption.unit);
  const [grind, setGrind] = useState("whole");
  const selectedWeight = options.find((item) => item.unit === weight) ?? options[0];
  const grindLabel = GRINDS.find(([value]) => value === grind)?.[1] ?? GRINDS[0][1];
  const configuredProduct = useMemo<Product>(() => ({
    ...product,
    id: `${product.id}-${weight}-${grind}`,
    name: `${product.name} · ${selectedWeight.unit} · ${grindLabel}`,
    price: selectedWeight.price,
    unit: selectedWeight.unit,
    notes: `${product.notes} · ${grindLabel}`,
  }), [grind, grindLabel, product, selectedWeight.price, selectedWeight.unit, weight]);

  return <div className="space-y-4 rounded-2xl border border-[#2A2421] bg-[#171412] p-5">
    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D97706]">Tuỳ chỉnh đơn hàng</p><h2 className="mt-1 text-lg font-bold text-white">Chọn khối lượng &amp; cỡ xay</h2></div>
    <fieldset><legend className="mb-2 text-xs font-semibold text-[#A69B93]">Khối lượng</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map((item) => <button key={item.unit} type="button" onClick={() => setWeight(item.unit)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${weight === item.unit ? "border-[#D97706] bg-[#D97706] text-[#1C1613]" : "border-[#3A302B] text-[#CDBBAA] hover:border-[#D97706]"}`}>{item.unit}</button>)}</div></fieldset>
    <label className="block text-xs font-semibold text-[#A69B93]">Cỡ xay<select value={grind} onChange={(event) => setGrind(event.target.value)} className="mt-2 w-full rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm font-normal text-white outline-none focus:border-[#D97706]">{GRINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <div className="flex items-center justify-between border-t border-[#2A2421] pt-4"><span className="text-xl font-extrabold text-[#E2A168]">{configuredProduct.price.toLocaleString("vi-VN")} VNĐ</span><div className="w-44"><AddToCartButton product={configuredProduct} /></div></div>
  </div>;
}
