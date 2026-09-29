import { Metadata } from "next";
import { BookOpen, Calculator } from "lucide-react";
import { JsonLdScript } from "../../components/seo/JsonLdScript";
import { buildBreadcrumbJsonLd } from "../../lib/site-data";
import CostCalculator from "../../components/sections/CostCalculator";

export const metadata: Metadata = {
  title: "Giải pháp B2B: Tính cost & Vận hành | TRIA CAFE",
  description:
    "Công cụ tính cost per cup espresso và dự phóng lợi nhuận cho quán cà phê. Kèm cẩm nang vệ sinh quầy bar, chỉnh cỡ xay và kiểm soát nhiệt độ máy pha cho đối tác B2B.",
  keywords: ["cost ly cà phê", "tính lợi nhuận quán cà phê", "máy pha B2B", "vệ sinh máy pha", "grind size"],
  alternates: { canonical: "/giai-phap-b2b" },
};

const GUIDES = [
  {
    title: "1. Quy trình vệ sinh quầy Bar hàng ngày",
    body: "Cách xả cặn tay pha, vệ sinh vòi đánh sữa để giữ chuẩn hương vị espresso...",
  },
  {
    title: "2. Hướng dẫn chỉnh cỡ xay (Grind Size)",
    body: "Kỹ thuật nhận biết dòng chảy nhanh/chậm để điều chỉnh cối xay công nghiệp...",
  },
  {
    title: "3. Kiểm soát nhiệt độ & Áp suất nồi hơi",
    body: "Tối ưu thông số PID giúp chiết xuất chuẩn xác các dòng hạt Robusta Việt...",
  },
];

export default function B2BPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Trang chủ", href: "/" },
          { name: "Giải pháp B2B", href: "/giai-phap-b2b" },
        ])}
      />

      <header className="rounded-2xl border border-[#2A2421] bg-[#171412] p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <Calculator className="h-6 w-6 text-[#C87D55]" aria-hidden />
          Góc Học Tập &amp; Công Cụ Tính Chi Phí (Cost Per Cup / B2B)
        </h1>
        <p className="mt-2 text-sm text-[#A69B93]">
          Tính toán chính xác giá thành 1 ly Espresso và dự phóng lợi nhuận cho mô hình quán cà phê của bạn.
        </p>
      </header>

      <CostCalculator />

      <section className="mt-8 space-y-4 rounded-2xl border border-[#2A2421] bg-[#171412] p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <BookOpen className="h-5 w-5 text-[#C87D55]" aria-hidden />
          Cẩm Nang Hướng Dẫn Vận Hành Máy Pha
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {GUIDES.map((guide) => (
            <article key={guide.title} className="space-y-2 rounded-xl border border-[#332A25] bg-[#221D1A] p-4">
              <h3 className="text-sm font-bold text-white">{guide.title}</h3>
              <p className="text-xs text-[#A69B93]">{guide.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
