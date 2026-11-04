"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Product } from "../../lib/site-data";
import ProductComments from "./ProductComments";

type ProductDetailTabsProps = {
  description: string;
  product: Product;
  viewedProducts: Product[];
};

export default function ProductDetailTabs({ description, product, viewedProducts }: ProductDetailTabsProps) {
  const [tab, setTab] = useState<"details" | "comments">("details");
  const [commentsCount, setCommentsCount] = useState(0);
  const similarProductsRef = useRef<HTMLDivElement>(null);
  const similarProducts = useMemo(
    () => viewedProducts.filter((item) => item.slug !== product.slug && item.category === product.category),
    [product.category, product.slug, viewedProducts],
  );
  const slideSimilarProducts = (direction: "previous" | "next") => {
    similarProductsRef.current?.scrollBy({
      left: direction === "next" ? similarProductsRef.current.clientWidth : -similarProductsRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-12 border-t border-[#2A2421] pt-6">
      <div className="flex gap-6 border-b border-[#2A2421]" role="tablist" aria-label="Thông tin sản phẩm">
        <button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "details" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Chi tiết sản phẩm
        </button>
        <button type="button" role="tab" aria-selected={tab === "comments"} onClick={() => setTab("comments")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "comments" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Bình luận ({commentsCount})
        </button>
      </div>

      <div hidden={tab !== "details"}>
        <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="cms-rich-editor text-sm leading-7 text-[#D8CDC2]" dangerouslySetInnerHTML={{ __html: description }} />
          <div className="h-fit">
            <div className="rounded-2xl border border-[#3A302B] bg-[#171412] p-4">
              <h2 className="mb-4 text-center text-xl font-bold text-white">Thông số kỹ thuật</h2>
              <div className="cms-rich-editor text-sm text-[#E8E2D9]" dangerouslySetInnerHTML={{ __html: product.technicalSpecs || "<p>Thông số kỹ thuật đang được cập nhật.</p>" }} />
            </div>
          </div>
          {similarProducts.length > 0 && (
            <section className="lg:col-span-2" aria-labelledby="similar-products-title">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 id="similar-products-title" className="text-xl font-bold text-white">Sản phẩm tương tự</h2>
                  <p className="mt-1 text-xs text-[#A69B93]">Thiết bị cùng nhóm để bạn tham khảo thêm</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => slideSimilarProducts("previous")} aria-label="Sản phẩm trước" className="rounded-full border border-[#3A302B] p-2 text-[#E2A168] transition hover:bg-[#2A2421]">
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                  <button type="button" onClick={() => slideSimilarProducts("next")} aria-label="Sản phẩm tiếp theo" className="rounded-full border border-[#3A302B] p-2 text-[#E2A168] transition hover:bg-[#2A2421]">
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div ref={similarProductsRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {similarProducts.map((item) => (
                  <Link key={item.slug} href={`/san-pham/${item.slug}`} className="w-full min-w-full snap-start overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412] transition hover:-translate-y-1 hover:border-[#D97706] sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]">
                    <Image src={item.image} alt={item.name} width={400} height={300} unoptimized className="aspect-[4/3] w-full object-cover" />
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-bold text-white">{item.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-[#E2A168]">{item.price.toLocaleString("vi-VN")} VNĐ</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <div hidden={tab !== "comments"} className="py-8">
        <div className="mb-5 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#D97706]" aria-hidden />
          <h2 className="text-lg font-bold text-white">Bình luận sản phẩm</h2>
        </div>
        <ProductComments productId={product.id} onCountChange={setCommentsCount} />
      </div>
    </section>
  );
}
