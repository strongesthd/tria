"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "../cart/CartProvider";
import type { Product } from "../../lib/site-data";

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add(product)}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#C87D55] px-2 py-2 text-center text-xs font-semibold text-white transition hover:bg-[#A85C38]"
    >
      <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> Thêm vào giỏ
    </button>
  );
}