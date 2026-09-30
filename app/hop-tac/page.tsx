import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock3, Coffee, MapPin, QrCode, Settings2, ShieldCheck, Sparkles, Store, Truck } from "lucide-react";
import { JsonLdScript } from "../../components/seo/JsonLdScript";
import PartnershipForm from "../../components/partnership/PartnershipForm";
import { BRANCHES, SITE_URL, buildBreadcrumbJsonLd } from "../../lib/site-data";

export const metadata: Metadata = {
  title: "Hợp tác Kiosk & Xe Cà phê Lưu động | TRIA CAFE",
  description: "Hợp tác điểm bán Kiosk cà phê tự động và nhượng quyền xe bán cà phê lưu động cùng TRIA Coffee. Vốn nhỏ, quay vòng nhanh, hạt rang tươi chất lượng.",
  keywords: ["hợp tác điểm bán", "kiosk cà phê", "nhượng quyền xe cà phê", "TRIA On-The-Go", "franchise cà phê"],
  alternates: { canonical: "/hop-tac" },
  openGraph: {
    type: "website",
    title: "TRIA Coffee On-The-Go - Hợp tác điểm bán",
    description: "Mô hình kiosk và xe cà phê tinh gọn, hạt rang tươi, vận hành nhanh và hỗ trợ trọn gói.",
    url: `${SITE_URL}/hop-tac`,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "TRIA Coffee On-The-Go" }],
  },
};

const models = [
  {
    title: "Mô hình A: Hợp tác vị trí",
    subtitle: "Location Partner - 0đ vốn",
    icon: MapPin,
    target: "Sảnh tòa nhà, chung cư, cửa hàng, cây xăng, trường học.",
    highlight: "TRIA đặt máy/xe và vận hành. Chủ mặt bằng nhận % chia sẻ doanh thu hàng tháng, không tốn chi phí quản lý hay vốn.",
    points: ["Không cần đầu tư máy móc", "Không phải tuyển barista", "Báo cáo doanh thu minh bạch"],
  },
  {
    title: "Mô hình B: Nhượng quyền tinh gọn",
    subtitle: "Micro-Franchise - 20–50 triệu VNĐ",
    icon: Truck,
    target: "Cá nhân muốn khởi nghiệp kinh doanh cà phê với vốn nhỏ.",
    highlight: "Trọn gói xe/máy pha, công thức, cà phê hạt rang tươi TRIA, đào tạo vận hành và hỗ trợ kỹ thuật.",
    points: ["Setup nhanh, mô hình gọn", "Đào tạo công thức & bán hàng", "Đồng hành kỹ thuật sau khai trương"],
  },
];

const strengths = [
  { icon: Coffee, title: "Hạt rang tươi", body: "Nguồn hạt TRIA ổn định, rang theo mẻ và chuẩn hoá công thức cho từng điểm bán." },
  { icon: Clock3, title: "Phục vụ 30–60 giây", body: "Workflow tinh gọn giúp phục vụ nhanh tại sảnh, văn phòng, trường học và điểm di động." },
  { icon: Settings2, title: "Quản lý tự động", body: "Theo dõi doanh thu, tồn kho và hiệu suất bán hàng để quyết định dựa trên dữ liệu." },
  { icon: ShieldCheck, title: "Đồng hành dài hạn", body: "Đào tạo, tài liệu vận hành và hỗ trợ kỹ thuật giúp đối tác bắt đầu tự tin." },
];

const locations = [
  ...BRANCHES.map((branch) => ({ ...branch, type: "TRIA Experience Store", beans: "Fine Robusta · Signature Blend" })),
  { id: "kiosk-q1", name: "TRIA On-The-Go Demo Kiosk", address: "Khu vực trung tâm TP. Thủ Đức", hours: "07:00 - 19:00", phone: "0989 668 113", features: [], image: "", slug: "kiosk-thu-duc", type: "Kiosk đang hoạt động", beans: "Fine Robusta · Espresso Blend" },
];

export default function PartnershipPage() {
  return (
    <div className="bg-[#1C1613]">
      <JsonLdScript data={[
        buildBreadcrumbJsonLd([{ name: "Trang chủ", href: "/" }, { name: "Hợp tác điểm bán", href: "/hop-tac" }]),
        { "@context": "https://schema.org", "@type": "Service", name: "TRIA Coffee On-The-Go Partnership", serviceType: "Hợp tác kiosk và xe cà phê lưu động", provider: { "@type": "Organization", name: "TRIA CAFE" }, areaServed: "Thành phố Hồ Chí Minh", url: `${SITE_URL}/hop-tac` },
      ]} />

      <section className="relative overflow-hidden border-b border-[#3A302B] bg-gradient-to-br from-[#171412] via-[#211914] to-[#0F0D0C] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div aria-hidden className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#D97706]/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D97706]/40 bg-[#D97706]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#F0B429]"><Sparkles className="h-3.5 w-3.5" /> TRIA On-The-Go</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">TRIA Coffee On-The-Go – Mô hình Kiosk Cà phê Tự động &amp; Bán lưu động Tinh gọn</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#CDBBAA] sm:text-lg">Cung cấp giải pháp cà phê hạt rang tươi nguyên chất chuẩn gu, tiện lợi cho điểm đến của bạn.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#dang-ky" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D97706] px-6 py-3.5 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E]">Đăng ký hợp tác vị trí <ArrowRight className="h-4 w-4" /></a>
              <a href="#ban-do" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#4A3B31] bg-[#221D1A] px-6 py-3.5 text-sm font-bold text-[#E8E2D9] transition hover:border-[#D97706]">Tìm điểm bán gần nhất <MapPin className="h-4 w-4 text-[#D97706]" /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-[#A69B93]"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Vốn linh hoạt</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Hỗ trợ vận hành</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Hạt rang tươi</span></div>
          </div>
          <div className="rounded-3xl border border-[#4A3B31] bg-[#221D1A] p-5 shadow-2xl shadow-black/30">
            <div className="rounded-2xl border border-[#3A302B] bg-[#171412] p-6"><Truck className="h-12 w-12 text-[#D97706]" /><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#D97706]">A better coffee stop</p><p className="mt-2 text-2xl font-bold text-white">Biến vị trí trống thành điểm chạm doanh thu.</p><p className="mt-3 text-sm leading-relaxed text-[#A69B93]">TRIA thiết kế mô hình vừa đủ gọn để triển khai nhanh, vừa đủ chuẩn để khách hàng nhớ đến hương vị.</p></div>
          </div>
        </div>
      </section>

      <section id="mo-hinh" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Two ways to partner</p><h2 className="mt-2 text-3xl font-extrabold text-white">Chọn mô hình phù hợp với nguồn lực của bạn</h2><p className="mt-3 text-sm leading-relaxed text-[#A69B93]">Từ chủ mặt bằng muốn có thêm doanh thu đến người khởi nghiệp cần một gói vận hành hoàn chỉnh.</p></div>
        <div className="grid gap-6 lg:grid-cols-2">{models.map((model) => { const Icon = model.icon; return <article key={model.title} className="rounded-2xl border border-[#3A302B] bg-[#171412] p-6 transition hover:border-[#D97706]/70"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706]/15 text-[#D97706]"><Icon className="h-6 w-6" /></div><span className="rounded-full bg-[#D97706]/15 px-3 py-1 text-xs font-bold text-[#F0B429]">{model.subtitle}</span></div><h3 className="mt-6 text-2xl font-bold text-white">{model.title}</h3><p className="mt-3 text-sm text-[#CDBBAA]"><strong className="text-[#F0B429]">Phù hợp:</strong> {model.target}</p><p className="mt-4 rounded-xl border border-[#4A3B31] bg-[#221D1A] p-4 text-sm leading-relaxed text-[#E8E2D9]">{model.highlight}</p><ul className="mt-5 grid gap-2 sm:grid-cols-3">{model.points.map((point) => <li key={point} className="flex items-start gap-2 text-xs text-[#A69B93]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{point}</li>)}</ul></article>})}</div>
      </section>

      <section id="ban-do" className="border-y border-[#2A2421] bg-[#171412] px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Find a TRIA point</p><h2 className="mt-2 text-3xl font-extrabold text-white">Bản đồ điểm bán &amp; trải nghiệm</h2></div><p className="max-w-md text-sm text-[#A69B93]">Danh sách điểm đang hoạt động để bạn ghé thử hạt và mô hình trước khi hợp tác.</p></div><div className="grid gap-4 lg:grid-cols-2">{locations.map((location) => <article key={location.id} className="rounded-2xl border border-[#3A302B] bg-[#221D1A] p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D97706]">{location.type}</span><h3 className="mt-1 text-lg font-bold text-white">{location.name}</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706]/15 text-[#D97706]"><Store className="h-5 w-5" /></div></div><p className="mt-4 flex gap-2 text-sm text-[#CDBBAA]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />{location.address}</p><div className="mt-3 grid gap-2 text-xs text-[#A69B93] sm:grid-cols-2"><span className="flex gap-2"><Clock3 className="h-4 w-4 text-[#D97706]" />{location.hours}</span><span className="flex gap-2"><Coffee className="h-4 w-4 text-[#D97706]" />{location.beans}</span></div><div className="mt-5 flex items-center justify-between border-t border-[#3A302B] pt-4"><span className="flex items-center gap-2 text-xs text-[#A69B93]"><QrCode className="h-5 w-5 text-[#D97706]" /> QR giảm giá túi hạt</span><a href={`tel:${location.phone.replace(/\s/g, "")}`} className="text-xs font-bold text-[#F0B429]">{location.phone}</a></div></article>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Why TRIA</p><h2 className="mt-2 text-3xl font-extrabold text-white">Một đối tác, đủ nền tảng để bắt đầu</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{strengths.map((strength) => { const Icon = strength.icon; return <article key={strength.title} className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5"><Icon className="h-7 w-7 text-[#D97706]" /><h3 className="mt-5 text-lg font-bold text-white">{strength.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#A69B93]">{strength.body}</p></article>})}</div></section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8"><div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#D97706]/40 bg-[#D97706]/10 p-6 md:flex-row"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97706]">Roast &amp; save</p><h2 className="mt-2 text-2xl font-bold text-white">Mua hạt rang tươi online cho điểm bán của bạn</h2><p className="mt-2 text-sm text-[#CDBBAA]">Dùng mã <strong className="text-[#F0B429]">ONTHEGO10</strong> để giảm 10% cho đơn hạt đầu tiên.</p></div><Link href="/san-pham?category=beans" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#D97706] px-5 py-3 text-sm font-bold text-[#1C1613]">Mua hạt rang tươi <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section id="dang-ky" className="scroll-mt-24 border-t border-[#2A2421] bg-[#0F0D0C] px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><div className="mb-8 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Start a conversation</p><h2 className="mt-2 text-3xl font-extrabold text-white">Đăng ký hợp tác cùng TRIA</h2><p className="mt-3 text-sm text-[#A69B93]">Để lại thông tin, đội ngũ TRIA sẽ liên hệ tư vấn mô hình phù hợp trong thời gian sớm nhất.</p></div><PartnershipForm /></div></section>
    </div>
  );
}
