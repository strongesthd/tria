import Image from "next/image";
import { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { JsonLdScript } from "../../components/seo/JsonLdScript";
import BookingForm from "../../components/shop/BookingForm";
import { BRANCHES, SITE_URL, buildBreadcrumbJsonLd } from "../../lib/site-data";

export const metadata: Metadata = {
  title: "Hệ thống quán & Trải nghiệm tại TP.HCM",
  description:
    "Ba cơ sở TRIA CAFE tại TP. Thủ Đức. Đặt lịch thử máy pha và cupping cà phê miễn phí.",
  alternates: { canonical: "/he-thong-quan" },
  openGraph: {
    title: "Hệ thống quán TRIA CAFE tại TP.HCM",
    description: "Đặt lịch thử máy pha và cupping cà phê miễn phí tại 2 chi nhánh TP.HCM.",
    images: [BRANCHES[0].image],
  },
};

function branchJsonLd(branch: (typeof BRANCHES)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/he-thong-quan#${branch.slug}`,
    name: branch.name,
    image: branch.image,
    telephone: branch.phone,
    openingHours: branch.hours.replace(" hàng ngày", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`,
  };
}

export default function BranchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          buildBreadcrumbJsonLd([
            { name: "Trang chủ", href: "/" },
            { name: "Hệ thống quán", href: "/he-thong-quan" },
          ]),
          ...BRANCHES.map(branchJsonLd),
        ]}
      />

      <header className="rounded-2xl border border-[#2A2421] bg-[#171412] p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <MapPin className="h-6 w-6 text-[#C87D55]" aria-hidden />
          Trải Nghiệm Thực Tế Tại 2 Quán Cà Phê TP.HCM
        </h1>
        <p className="mt-2 text-sm text-[#A69B93]">
          Đến trực tiếp để uống thử cà phê hạt rang tươi, đứng bar pha thử trên máy pha công nghiệp trước khi chốt mua.
        </p>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {BRANCHES.map((loc) => (
          <article key={loc.id} id={loc.slug} className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412]">
            <Image
              src={loc.image}
              alt={`Không gian ${loc.name}`}
              width={800}
              height={450}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-56 w-full object-cover"
            />
            <div className="space-y-4 p-6">
              <h2 className="text-xl font-bold text-white">{loc.name}</h2>
              <div className="space-y-2 text-xs text-[#A69B93]">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C87D55]" aria-hidden />
                  <span>{loc.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-[#C87D55]" aria-hidden />
                  <span>{loc.hours}</span>
                </p>
                <p className="flex items-center gap-2">
                  <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="font-semibold text-[#E2A168] hover:underline">
                    {loc.phone}
                  </a>
                </p>
              </div>
              <div className="border-t border-[#2A2421] pt-3">
                <h3 className="mb-2 text-xs font-semibold text-[#E2A168]">Trải nghiệm sẵn có tại chi nhánh:</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {loc.features.map((feat) => (
                    <li key={feat} className="text-xs text-[#E8E2D9]">• {feat}</li>
                  ))}
                </ul>
              </div>
              <a
                href="#booking"
                className="block w-full rounded-xl border border-[#C87D55]/30 bg-[#221D1A] py-3 text-center text-xs font-bold text-[#E2A168] transition-all hover:bg-[#2A2421]"
              >
                Chọn Chi Nhánh Này Để Đặt Lịch Hẹn
              </a>
            </div>
          </article>
        ))}
      </div>

      <div id="booking" className="mx-auto mt-10 max-w-3xl scroll-mt-28 rounded-2xl border border-[#2A2421] bg-[#171412] p-8">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-xl font-bold text-white">Đăng Ký Đặt Lịch Thử Máy &amp; Cupping Cà Phê</h2>
          <p className="text-xs text-[#A69B93]">Đội ngũ Kỹ thuật &amp; Barista Trainer sẽ chuẩn bị sẵn thiết bị &amp; mẫu hạt cho bạn.</p>
        </div>
        <BookingForm />
      </div>
    </div>
  );
}
