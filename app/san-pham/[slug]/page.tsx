import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, Star } from "lucide-react";
import { JsonLdScript } from "../../../components/seo/JsonLdScript";
import AddToCartButton from "../../../components/shop/AddToCartButton";
import BeanPurchaseOptions from "../../../components/shop/BeanPurchaseOptions";
import ProductGallery from "../../../components/shop/ProductGallery";
import { HOTLINE, PRODUCTS, buildProductJsonLd, buildBreadcrumbJsonLd } from "../../../lib/site-data";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          buildBreadcrumbJsonLd([
            { name: "Trang chủ", href: "/" },
            { name: "Sản phẩm", href: "/san-pham" },
            { name: product.name, href: `/san-pham/${product.slug}` },
          ]),
          buildProductJsonLd(product),
        ]}
      />

      <Link href="/san-pham" className="inline-flex items-center gap-1 text-xs font-bold text-[#E2A168] hover:underline">
        ← Về danh sách sản phẩm
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <ProductGallery name={product.name} images={[product.image, ...(product.images ?? [])]} />
          <span className={`absolute left-4 top-4 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${product.target === "b2b" ? "bg-[#C87D55] text-white" : "border border-[#C87D55]/30 bg-[#2A2421] text-[#E2A168]"}`}>
            {product.target === "b2b" ? "Dành cho B2B / Quán" : "Dành cho Home Barista"}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
              {product.category === "beans" ? "TRIA Beans" : product.category === "machines" ? "TRIA Machines" : "Barista Tools"}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-current" aria-hidden /> {product.rating.toFixed(1)}
              </span>
              <span className="text-[#A69B93]">{product.reviews} đánh giá</span>
              <span className="text-[#A69B93]">{product.unit}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#B9A99B]">{product.description}</p>

          <div className="space-y-2 rounded-2xl border border-[#2A2421] bg-[#171412] p-5 text-sm">
            <h2 className="flex items-center gap-2 font-bold text-white">
              <Check className="h-4 w-4 text-emerald-400" aria-hidden /> Đặc tính nổi bật
            </h2>
            <p className="text-[#D8CDC2]">{product.notes}</p>
            <p className="pt-1 text-xs text-[#A69B93]">Mức rang: {product.roastLevel}</p>
          </div>

          {product.category === "beans" ? (
            <BeanPurchaseOptions product={product} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#221D1A] to-[#171412] p-5">
              <div>
                <p className="text-xs text-[#A69B93]">Giá tham khảo</p>
                <p className="text-3xl font-extrabold text-[#E2A168]">{product.price.toLocaleString("vi-VN")} VNĐ</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Link href="/he-thong-quan#booking" className="rounded-xl border border-[#C87D55]/30 bg-[#221D1A] px-5 py-3 text-sm font-semibold text-[#E2A168] transition-all hover:bg-[#2A2421]">Thử Tại Quán</Link>
                <div className="w-40"><AddToCartButton product={product} /></div>
              </div>
            </div>
          )}

          <p className="text-xs text-[#81746B]">
            Hỗ trợ đặt hàng:{" "}
            <a href={`tel:${HOTLINE.replace(/\s/g, "")}`} className="font-bold text-[#E2A168] hover:underline">{HOTLINE}</a> · Miễn phí tư vấn setup máy tại quán B2B.
          </p>
        </div>
      </div>
    </div>
  );
}
