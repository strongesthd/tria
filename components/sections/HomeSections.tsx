"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, Settings, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { PRODUCT_CATEGORIES, PRODUCTS, type Category, type Product } from "../../lib/site-data";
import { useCart } from "../cart/CartProvider";

export function Hero({ branchCount = 3 }: { branchCount?: number }) {
  return (
    <section className="relative overflow-hidden border-b border-[#2A2421] bg-gradient-to-b from-[#171412] via-[#0F0D0C] to-[#0F0D0C] py-12 md:py-16">
      <div aria-hidden className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#C87D55]/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#E2A168]/5 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="space-y-6 text-center md:col-span-7 md:text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-[#332A25] bg-[#221D1A] px-3.5 py-1.5 text-xs font-medium text-[#E2A168]">
              <Sparkles className="h-3.5 w-3.5 text-[#C87D55]" aria-hidden />
              <span>TRIA CAFE / The Vietnamese Coffee Ecosystem</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              TRIA CAFE <br />
              <span className="bg-gradient-to-r from-[#E2A168] via-[#C87D55] to-[#A85C38] bg-clip-text text-transparent">
                Nâng Tầm Cà Phê Việt
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#A69B93] sm:text-lg">
              Hệ sinh thái từ hạt cà phê Việt, máy pha chuyên nghiệp đến cộng đồng tri thức. Chọn đúng gu, đúng máy và trải nghiệm thực tế tại {branchCount} flagship store của TRIA ở TP. Hồ Chí Minh.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row md:justify-start">
              <Link href="/san-pham" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C87D55] to-[#A85C38] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#C87D55]/25 transition-all hover:opacity-95 sm:w-auto">
                <span>Trải nghiệm sản phẩm</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/cong-dong" className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#3A302B] bg-[#221D1A] px-7 py-3.5 font-semibold text-[#E8E2D9] transition-all hover:bg-[#2A2421] sm:w-auto">
                <Users className="h-4 w-4 text-[#C87D55]" aria-hidden />
                <span>Gia nhập TRIA Community</span>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-[#2A2421] pt-6">
              <div>
                <span className="block text-2xl font-bold text-white">{branchCount}+</span>
                <span className="text-xs text-[#A69B93]">Chi nhánh Demo TP.HCM</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">100%</span>
                <span className="text-xs text-[#A69B93]">Hạt Nguyên Chất Rang Tươi</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">24/7</span>
                <span className="text-xs text-[#A69B93]">Hỗ Trợ Kỹ Thuật B2B</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative rounded-2xl border border-[#3A302B] bg-gradient-to-b from-[#332A25] to-[#1C1715] p-2 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
                alt="Quầy bar espresso tại TRIA CAFE với máy pha chuyên nghiệp"
                width={800}
                height={600}
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="h-80 w-full rounded-xl object-cover"
              />
              <div className="absolute -bottom-5 -left-5 flex max-w-xs items-center gap-3 rounded-xl border border-[#3A302B] bg-[#171412] p-4 shadow-xl">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C87D55]/20 text-[#C87D55]">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Trải Nghiệm Thực Tế</h2>
                  <p className="text-xs text-[#A69B93]">Thử hạt &amp; máy miễn phí trước khi mua</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pillars() {
  const pillars = [
    {
      href: "/san-pham?category=beans",
      icon: Coffee,
      title: "TRIA Beans",
      body: "Fine Robusta & Arabica phối trộn chuẩn gu, rang tươi theo mẻ nhỏ tại Việt Nam.",
      cta: "Khám phá hạt",
    },
    {
      href: "/san-pham?category=machines",
      icon: Settings,
      title: "TRIA Machines",
      body: "Máy pha chính hãng, setup đúng nhu cầu và dịch vụ kỹ thuật tận tâm cho mọi quy mô.",
      cta: "Xem thiết bị",
    },
    {
      href: "/cong-dong",
      icon: Users,
      title: "TRIA Hub",
      body: "Cộng đồng tri thức và hai không gian thực chiến để học, thử và kết nối.",
      cta: "Vào cộng đồng",
    },
  ];

  return (
    <section className="border-b border-[#E8DED2] bg-[#FDFBF7] py-10 text-[#1C1613]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97706]">The TRIA Ecosystem</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Một hệ sinh thái. Ba điểm chạm.</h2>
          </div>
          <p className="max-w-md text-sm text-[#756A61]">Từ nông trại đến quầy bar, TRIA đồng hành cùng từng khoảnh khắc cà phê của bạn.</p>
        </div>
        <div className="grid gap-px border border-[#E8DED2] bg-[#E8DED2] md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="bg-[#FDFBF7] p-6 transition-colors hover:bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-7 w-7 text-[#D97706]" aria-hidden />
                  <span className="text-xs font-bold text-[#B9A99B]">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#756A61]">{pillar.body}</p>
                <Link href={pillar.href} className="mt-5 flex items-center gap-2 text-sm font-bold text-[#D97706] hover:underline">
                  {pillar.cta} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProductCategoryCards({ categories = PRODUCT_CATEGORIES }: { categories?: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Shop by category</p>
        <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Danh mục sản phẩm</h2>
        <p className="mt-1 text-sm text-[#A69B93]">Chọn nhóm sản phẩm phù hợp với hành trình cà phê của bạn.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/san-pham?category=${category.id}`}
            className="group relative min-h-48 overflow-hidden rounded-2xl border border-[#3A302B] text-left transition-all hover:border-[#D97706]/70"
          >
            <Image
              src={category.image}
              alt={category.title}
              width={600}
              height={400}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 33vw"
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-105"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/60 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9B27B]">{category.subtitle}</span>
              <span className="mt-1 text-xl font-bold text-white">{category.title}</span>
              <span className="mt-1 text-xs text-[#D8CDC2]">{category.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProducts({ products = PRODUCTS }: { products?: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Coffee className="h-6 w-6 text-[#C87D55]" aria-hidden /> Sản phẩm nổi bật
        </h2>
        <Link href="/san-pham" className="text-sm font-semibold text-[#E2A168] hover:underline">
          Xem tất cả →
        </Link>
      </div>
      <FeaturedGrid products={products} />
    </section>
  );
}

function FeaturedGrid({ products }: { products: Product[] }) {
  const { add } = useCart();
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 4).map((p) => (
        <li key={p.id} className="group overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412] transition-all hover:border-[#C87D55]/50">
          <div className="relative h-48 overflow-hidden bg-[#221D1A]">
            <Image src={p.image} alt={p.name} width={400} height={300} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" />
            <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${p.target === "b2b" ? "bg-[#C87D55] text-white" : "border border-[#C87D55]/30 bg-[#2A2421] text-[#E2A168]"}`}>
              {p.target === "b2b" ? "Dành cho B2B / Quán" : "Dành cho Home Barista"}
            </span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A69B93]">
              <span className="flex items-center gap-1 text-amber-400"><Star className="h-3.5 w-3.5 fill-current" />{p.rating} ({p.reviews})</span>
              <span>{p.unit}</span>
            </div>
            <h3 className="text-base font-bold leading-snug text-white line-clamp-2 group-hover:text-[#E2A168] transition-colors">{p.name}</h3>
            <p className="text-xs text-[#A69B93] line-clamp-2">{p.description}</p>
            <div className="border-t border-[#2A2421] pt-2 text-xs text-[#E8E2D9]"><span className="text-[#A69B93]">Đặc tính:</span> {p.notes}</div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-extrabold text-[#E2A168]">{p.price.toLocaleString("vi-VN")} VNĐ</span>
              <button type="button" onClick={() => add(p)} className="rounded-xl bg-[#C87D55] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#A85C38]">Thêm vào giỏ</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TrustBanner({ branchCount = 3 }: { branchCount?: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#3A302B] bg-gradient-to-r from-[#221D1A] via-[#2A2421] to-[#221D1A] p-8 md:flex-row">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-bold text-white">Bạn cần mua máy pha B2B cho quán hoặc văn phòng?</h2>
          <p className="text-sm text-[#A69B93]">
            Đến ngay {branchCount} chi nhánh TP.HCM để thử máy trực tiếp, thử espresso từ hạt của bạn và nhận báo giá sỉ tốt nhất.
          </p>
        </div>
        <Link href="/he-thong-quan#booking" className="shrink-0 rounded-xl bg-[#C87D55] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#A85C38]">
          Đặt Lịch Cupping &amp; Demo Máy
        </Link>
      </div>
    </section>
  );
}
