"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../../lib/site-data";

type ProductDetailTabsProps = {
  description: string;
  product: Product;
  viewedProducts: Product[];
};

const VIEWED_PRODUCTS_KEY = "tria-viewed-products";

export default function ProductDetailTabs({ description, product, viewedProducts }: ProductDetailTabsProps) {
  const [tab, setTab] = useState<"details" | "comments">("details");
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const storedSlugs = JSON.parse(localStorage.getItem(VIEWED_PRODUCTS_KEY) || "[]");
      const slugs = [product.slug, ...storedSlugs.filter((slug: unknown) => slug !== product.slug)].slice(0, 8);
      localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(slugs));
      setRecentProducts(slugs.map((slug: string) => viewedProducts.find((item) => item.slug === slug)).filter(Boolean) as Product[]);
    } catch (error) {
      console.error("[product-detail] Could not restore viewed products.", error);
    }
  }, [product, viewedProducts]);

  const categoryLabels = { beans: "Cà phê hạt", machines: "Máy pha cà phê", accessories: "Phụ kiện" };
  const specifications = [
    ["Sản phẩm", product.name],
    ["Danh mục", categoryLabels[product.category]],
    ["Đơn vị", product.unit],
    ...(product.roastLevel && product.roastLevel !== "N/A" ? [["Mức rang", product.roastLevel]] : []),
    ["Giá tham khảo", `${product.price.toLocaleString("vi-VN")} VNĐ`],
  ];

  return (
    <section className="mt-12 border-t border-[#2A2421] pt-6">
      <div className="flex gap-6 border-b border-[#2A2421]" role="tablist" aria-label="Thông tin sản phẩm">
        <button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "details" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Chi tiết sản phẩm
        </button>
        <button type="button" role="tab" aria-selected={tab === "comments"} onClick={() => setTab("comments")} className={`border-b-2 px-1 pb-3 text-sm font-bold ${tab === "comments" ? "border-[#D97706] text-white" : "border-transparent text-[#81746B] hover:text-[#CDBBAA]"}`}>
          Bình luận ({0})
        </button>
      </div>

      {tab === "details" ? (
        <div className="py-6">
          <div className="cms-rich-editor text-sm leading-7 text-[#D8CDC2]" dangerouslySetInnerHTML={{ __html: description }} />
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Thông số kỹ thuật</h2>
            <div className="overflow-hidden rounded-2xl border border-[#3A302B]">
              <dl className="divide-y divide-[#3A302B]">
                {specifications.map(([label, value]) => (
                  <div key={label} className="grid gap-2 bg-[#171412] px-4 py-3 text-sm sm:grid-cols-[12rem_1fr]">
                    <dt className="text-[#A69B93]">{label}</dt>
                    <dd className="font-semibold text-[#E8E2D9]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center py-10 text-center">
          <MessageCircle className="h-8 w-8 text-[#D97706]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-white">Chưa có bình luận nào</p>
          <p className="mt-1 text-xs text-[#81746B]">Hãy đăng nhập để chia sẻ đánh giá về sản phẩm.</p>
        </div>
      )}
      {tab === "details" && recentProducts.length > 1 && (
        <section className="border-t border-[#2A2421] py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Sản phẩm đã xem</h2>
            <button type="button" onClick={() => { localStorage.removeItem(VIEWED_PRODUCTS_KEY); setRecentProducts([]); }} className="text-xs text-[#A69B93] hover:text-[#E2A168]">
              Xóa lịch sử
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.filter((item) => item.slug !== product.slug).map((item) => (
              <Link key={item.slug} href={`/san-pham/${item.slug}`} className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412] transition hover:-translate-y-1 hover:border-[#D97706]">
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
    </section>
  );
}
