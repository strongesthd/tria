"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "../../lib/site-data";

export default function MachineBundleOptions({ product, accessories }: { product: Product; accessories: Product[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedAccessories = accessories.filter((accessory) => selected.includes(accessory.id));
  const total = product.price + selectedAccessories.reduce((sum, accessory) => sum + accessory.price, 0);
  const configuredProduct = useMemo<Product>(() => ({
    ...product,
    id: selected.length ? `${product.id}-bundle-${selected.join(",")}` : product.id,
    name: selectedAccessories.length ? `${product.name} + ${selectedAccessories.map((accessory) => accessory.name).join(" + ")}` : product.name,
    price: total,
    unit: selectedAccessories.length ? "Combo" : product.unit,
  }), [product, selected, selectedAccessories, total]);

  return <div className="space-y-4 rounded-2xl border border-[#2A2421] bg-[#171412] p-5">
    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D97706]">Tuỳ chọn đi kèm</p><h2 className="mt-1 text-lg font-bold text-white">Chọn phụ kiện cho máy</h2></div>
    <div className="grid gap-2">{accessories.map((accessory) => <label key={accessory.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#3A302B] p-3 text-sm text-[#CDBBAA]"><input type="checkbox" checked={selected.includes(accessory.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, accessory.id] : current.filter((id) => id !== accessory.id))} className="h-4 w-4 accent-[#D97706]" /><span className="min-w-0 flex-1"><span className="block font-semibold text-white">{accessory.name}</span><span className="text-xs text-[#81746B]">{accessory.price.toLocaleString("vi-VN")} VNĐ</span></span></label>)}</div>
    <div className="flex items-center justify-between border-t border-[#2A2421] pt-4"><span className="text-xl font-extrabold text-[#E2A168]">{total.toLocaleString("vi-VN")} VNĐ</span><div className="w-44"><AddToCartButton product={configuredProduct} /></div></div>
  </div>;
}
