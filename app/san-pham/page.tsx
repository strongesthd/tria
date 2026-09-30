import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Coffee, Star } from "lucide-react";
import { JsonLdScript } from "../../components/seo/JsonLdScript";
import AddToCartButton from "../../components/shop/AddToCartButton";
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  type ProductCategory,
  type Target,
} from "../../lib/site-data";

type SearchParams = Promise<{ category?: string; target?: string; q?: string }>;

/** Build a unique, length-optimised title for every filter combination. */
function seoTitle(category: string, target: string): string {
  const cat = PRODUCT_CATEGORIES.find((c) => c.id === category);
  const targetLabel = target === "b2c" ? "Cá nhân" : target === "b2b" ? "Quán & Doanh nghiệp" : null;
  const suffix = " | TRIA CAFE";

  if (cat && targetLabel) return `${cat.title} cho ${targetLabel}${suffix}`;
  if (cat) return `${cat.subtitle} - ${cat.title}${suffix}`;
  if (target === "b2b") return `Máy pha & cà phê B2B${suffix}`;
  if (targetLabel) return `Sản phẩm cà phê B2C${suffix}`;
  return `Sản phẩm cà phê & máy pha${suffix}`;
}

/** Build a unique meta description for each filter combination. */
function seoDescription(category: string, target: string): string {
  const cat = PRODUCT_CATEGORIES.find((c) => c.id === category);
  const targetPhrase =
    target === "b2c" ? "dành cho cá nhân yêu cà phê"
    : target === "b2b" ? "dành cho quán và doanh nghiệp F&B"
    : "";
  if (cat) return `${cat.description} Khám phá ${cat.title.toLowerCase()} ${targetPhrase} tại TRIA CAFE.`.trim();
  if (targetPhrase) return `Khám phá hạt cà phê rang tươi, máy pha espresso và phụ kiện barista ${targetPhrase} tại TRIA CAFE.`;
  return "Khám phá hạt cà phê rang tươi, máy pha espresso và phụ kiện barista chính hãng tại TRIA CAFE.";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category || "all";
  const target = params.target || "all";
  const hasSearchQuery = Boolean(params.q?.trim());
  return {
    title: seoTitle(category, target),
    description: seoDescription(category, target),
    alternates: { canonical: `/san-pham${category !== "all" ? `?category=${category}` : ""}${target !== "all" ? `${category !== "all" ? "&" : "?"}target=${target}` : ""}` },
    ...(hasSearchQuery ? { robots: { index: false, follow: true } } : {}),
  };
}

const TARGETS: { id: Target | "all"; label: string }[] = [
  { id: "all", label: "Tất Cả Khách" },
  { id: "b2c", label: "Cá Nhân (B2C)" },
  { id: "b2b", label: "Quán / Cty (B2B)" },
];

/** Unique H1 for every filter variant. */
function h1Text(category: string, target: string): string {
  const cat = PRODUCT_CATEGORIES.find((c) => c.id === category);
  const targetLabel = target === "b2c" ? "Cá nhân" : target === "b2b" ? "Quán & Doanh nghiệp" : "";
  if (cat) return `${cat.title}${targetLabel ? ` cho ${targetLabel}` : ""}`;
  if (targetLabel) return `Sản phẩm cho ${targetLabel}`;
  return "Danh mục sản phẩm TRIA";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = params.category || "all";
  const target = params.target || "all";
  const query = (params.q || "").trim().toLowerCase();

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = category === "all" || p.category === (category as ProductCategory);
    const matchesTarget = target === "all" || p.target === (target as Target);
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.notes.toLowerCase().includes(query);
    return matchesCategory && matchesTarget && matchesQuery;
  });

  const categorySlug = category === "all" ? "" : category;
  const targetSlug = target === "all" ? "" : target;
  const qSlug = query ? `&q=${encodeURIComponent(query)}` : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript data={[buildBreadcrumbJsonLd([{ name: "Trang chủ", href: "/" }, { name: "Sản phẩm", href: "/san-pham" }])]} />

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Shop by category</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">{h1Text(category, target)}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#A69B93]">
          Cà phê hạt rang tươi nguyên chất &amp; máy pha nhập khẩu chính hãng. Lọc theo đối tượng để tìm đúng giải pháp.
        </p>
      </header>

      {/* Category cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href={targetSlug ? `/san-pham?target=${targetSlug}` : "/san-pham"}
          aria-current={category === "all" ? "page" : undefined}
          className={`group relative flex min-h-36 flex-col justify-end overflow-hidden rounded-2xl border p-5 transition-all ${category === "all" ? "border-[#D97706] ring-1 ring-[#D97706]" : "border-[#3A302B] hover:border-[#D97706]/70"}`}
        >
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#171412] to-transparent" />
          <span className="relative z-10 text-lg font-bold text-white">Tất cả sản phẩm</span>
          <span className="relative z-10 mt-1 text-xs text-[#A69B93]">Xem toàn bộ danh mục</span>
        </Link>
        {PRODUCT_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/san-pham?category=${cat.id}${targetSlug ? `&target=${targetSlug}` : ""}${qSlug}`}
            aria-current={category === cat.id ? "page" : undefined}
            className={`group relative min-h-48 overflow-hidden rounded-2xl border text-left transition-all ${category === cat.id ? "border-[#D97706] ring-1 ring-[#D97706]" : "border-[#3A302B] hover:border-[#D97706]/70"}`}
          >
            <Image src={cat.image} alt={cat.title} width={600} height={400} loading="lazy" sizes="(max-width: 640px) 100vw, 33vw" className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-105" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/60 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9B27B]">{cat.subtitle}</span>
              <span className="mt-1 text-xl font-bold text-white">{cat.title}</span>
              <span className="mt-1 text-xs text-[#D8CDC2]">{cat.description}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#2A2421] bg-[#171412] p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-[#C87D55]" aria-hidden />
          <div>
            <h2 className="text-xl font-bold text-white">Bộ lọc sản phẩm</h2>
            <p className="text-xs text-[#A69B93]">{filtered.length} sản phẩm khớp bộ lọc</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-xl border border-[#332A25] bg-[#221D1A] p-1">
            {TARGETS.map((t) => {
              const href = `/san-pham?${[categorySlug && `category=${categorySlug}`, t.id !== "all" && `target=${t.id}`, query && `q=${encodeURIComponent(query)}`].filter(Boolean).join("&")}` || "/san-pham";
              return (
                <Link key={t.id} href={href} aria-current={target === t.id ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${target === t.id ? "bg-[#C87D55] text-white" : "text-[#A69B93] hover:text-white"}`}>
                  {t.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap rounded-xl border border-[#332A25] bg-[#221D1A] p-1">
            <Link href={`/san-pham${targetSlug ? `?target=${targetSlug}` : ""}`} aria-current={category === "all" ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${category === "all" ? "bg-[#3A302B] text-white" : "text-[#A69B93] hover:text-white"}`}>
              Tất Cả Loại
            </Link>
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/san-pham?category=${cat.id}${targetSlug ? `&target=${targetSlug}` : ""}${qSlug}`} aria-current={category === cat.id ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${category === cat.id ? "bg-[#3A302B] text-white" : "text-[#A69B93] hover:text-white"}`}>
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p) => (
          <li key={p.id} className="group overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412] transition-all hover:border-[#C87D55]/50">
            <div className="relative h-48 overflow-hidden bg-[#221D1A]">
              <Image src={p.image} alt={p.name} width={400} height={300} loading="lazy" sizes="(max-width: 1024px) 50vw, 25vw" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${p.target === "b2b" ? "bg-[#C87D55] text-white" : "border border-[#C87D55]/30 bg-[#2A2421] text-[#E2A168]"}`}>
                {p.target === "b2b" ? "Dành cho B2B / Quán" : "Dành cho Home Barista"}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between text-xs text-[#A69B93]">
                <span className="flex items-center gap-1 text-amber-400"><Star className="h-3.5 w-3.5 fill-current" /> {p.rating} ({p.reviews})</span>
                <span>{p.unit}</span>
              </div>
              <h3 className="text-base font-bold leading-snug text-white line-clamp-2 group-hover:text-[#E2A168] transition-colors">{p.name}</h3>
              <p className="text-xs text-[#A69B93] line-clamp-2">{p.description}</p>
              <div className="border-t border-[#2A2421] pt-2 text-xs text-[#E8E2D9]"><span className="text-[#A69B93]">Đặc tính:</span> {p.notes}</div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-extrabold text-[#E2A168]">{p.price.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/san-pham/${p.slug}`} className="rounded-xl border border-[#3A302B] bg-[#221D1A] px-2 py-2 text-center text-xs font-semibold text-[#E2A168] transition-all hover:bg-[#2A2421]">Xem chi tiết</Link>
                <AddToCartButton product={p} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!filtered.length && (
        <div className="rounded-2xl border border-dashed border-[#4A3B31] p-10 text-center text-sm text-[#A69B93]">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      )}

      <JsonLdScript data={filtered.map(buildProductJsonLd)} />
    </div>
  );
}
