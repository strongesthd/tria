import Image from "next/image";
import Link from "next/link";
import {
  BookOpenText,
  ChevronRight,
  Clock3,
  Coffee,
  Globe,
  Headset,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getFooterData } from "../../lib/footer-data";
import { HOTLINE, HOTLINE_MOBILE } from "../../lib/site-data";

type FooterItem = { id: string; label: string; href: string };

function FooterColumn({
  title,
  icon: Icon,
  items,
  available,
}: {
  title: string;
  icon: LucideIcon;
  items: FooterItem[];
  available: boolean;
}) {
  return (
    <section className="border-t border-[#D9CCBD] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
      <h2 className="flex min-h-8 items-center gap-2 text-sm font-bold text-[#321B0E]">
        <Icon className="h-5 w-5 shrink-0 text-[#6B3518]" aria-hidden />
        <span>{title}</span>
      </h2>
      {items.length ? (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                href={item.href}
                className="group flex min-w-0 items-start gap-2 text-[13px] leading-5 text-[#4E4138] transition-colors hover:text-[#B7511B]"
              >
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9A5A32] transition-transform group-hover:translate-x-0.5" aria-hidden />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-[#78695D]">
          {available ? "Chưa có nội dung đang hiển thị." : "Nội dung đang được cập nhật."}
        </p>
      )}
    </section>
  );
}

export default async function Footer() {
  const data = await getFooterData();
  const categoryItems = data.categories.map((category) => ({
    id: category.id,
    label: category.title,
    href: category.href,
  }));
  const articleItems = data.articles.map((article) => ({
    id: article.id,
    label: article.title,
    href: article.href,
  }));
  if (data.articles.length) {
    articleItems.push({ id: "news-index", label: "Xem tất cả bài viết", href: "/tin-tuc" });
  }
  const bottomPolicyLinks = data.policyLinks.slice(0, 2);
  const featuredSupportLink = data.supportLinks[0];

  return (
    <footer className="border-t border-[#D9CCBD] bg-[#F7F2E9] text-[#35251A]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))] lg:gap-0 lg:px-8 lg:py-10">
        <div className="sm:col-span-2 lg:col-span-1 lg:pr-6">
          <Image
            src="/images/tria_logo.png"
            alt="TRIA CAFE"
            width={260}
            height={64}
            className="h-auto w-52 object-contain"
          />
          <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#5B4D42]">
            Cà phê Việt, thiết bị pha chế và những trải nghiệm thật dành cho người yêu cà phê.
          </p>
        </div>

        <FooterColumn title="Danh mục sản phẩm" icon={Coffee} items={categoryItems} available={data.available} />
        <FooterColumn title="Bài viết mới" icon={BookOpenText} items={articleItems} available={data.available} />
        <FooterColumn title="Chính sách" icon={ShieldCheck} items={data.policyLinks} available={data.available} />
        <FooterColumn title="Tư vấn & hỗ trợ" icon={Headset} items={data.supportLinks} available={data.available} />
      </div>

      <section className="border-y border-[#E1D5C5] bg-[#F0E8DB]">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_270px] xl:gap-6">
          <div className="min-w-0">
            <div className="mb-5 flex items-start gap-3">
              <MapPin className="mt-0.5 h-7 w-7 shrink-0 fill-[#6B3518] text-[#6B3518]" aria-hidden />
              <div>
                <h2 className="text-lg font-extrabold text-[#321B0E]">Điểm trải nghiệm TRIA</h2>
                <p className="mt-1 text-xs text-[#78695D]">Đến thử máy, nếm hạt và chọn giải pháp phù hợp.</p>
              </div>
            </div>

            {data.branches.length ? (
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-4">
                {data.branches.map((branch) => {
                  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`;
                  return (
                    <li key={branch.id} className="w-full max-w-64 min-w-0 overflow-hidden rounded-md border border-[#DDD0BF] bg-[#FFFCF6] shadow-sm">
                      <div className="relative aspect-[16/8] overflow-hidden bg-[#DED2C2]">
                        <Image
                          src={branch.image}
                          alt={`Không gian ${branch.name}`}
                          width={480}
                          height={240}
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1536px) 33vw, 20vw"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        />
                      </div>
                      <div className="flex min-h-[190px] flex-col p-4">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#321B0E]">{branch.name}</h3>
                        <p className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-[#65564B]">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A4A24]" aria-hidden />
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{branch.address}</span>
                        </p>
                        <p className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-[#65564B]">
                          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A4A24]" aria-hidden />
                          <span className="min-w-0 break-words">{branch.hours}</span>
                        </p>
                        <div className="mt-auto pt-3">
                          <a
                            href={mapHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-8 self-start items-center justify-center gap-1.5 rounded-md bg-[#603116] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#87471F] focus-visible:outline-[#D97706]"
                          >
                            <Navigation className="h-3 w-3" aria-hidden />
                            Xem bản đồ
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-md border border-dashed border-[#D4C5B2] px-4 py-6 text-center text-sm text-[#78695D]">
                {data.available ? "Chưa có điểm trải nghiệm đang hoạt động." : "Danh sách điểm trải nghiệm đang được cập nhật."}
              </p>
            )}
          </div>

          <aside className="border-t border-[#D9CCBD] pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-1">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#321B0E]">
              <Phone className="h-5 w-5 text-[#6B3518]" aria-hidden />
              Liên hệ với TRIA
            </h2>
            <div className="mt-4 space-y-4 text-sm text-[#4E4138]">
              <p className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#8A4A24]" aria-hidden />
                <span>
                  <a href={`tel:${HOTLINE.replace(/\s/g, "")}`} className="font-bold text-[#321B0E] hover:text-[#B7511B]">{HOTLINE}</a>
                  <br />
                  <a href={`tel:${HOTLINE_MOBILE.replace(/\s/g, "")}`} className="text-xs text-[#78695D] hover:text-[#B7511B]">{HOTLINE_MOBILE}</a>
                </span>
              </p>
              <p className="flex min-w-0 items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#8A4A24]" aria-hidden />
                <a href="mailto:hello@triacafe.vn" className="break-all text-[13px] hover:text-[#B7511B]">hello@triacafe.vn</a>
              </p>
              <p className="flex items-center gap-3">
                <Globe className="h-4 w-4 shrink-0 text-[#8A4A24]" aria-hidden />
                <Link href="/" className="text-[13px] hover:text-[#B7511B]">triacafe.vn</Link>
              </p>
            </div>
            {featuredSupportLink && (
              <Link
                href={featuredSupportLink.href}
                className="mt-5 inline-flex min-h-10 max-w-full items-center gap-2 rounded-md border border-[#A87852] px-4 py-2 text-xs font-bold text-[#603116] transition-colors hover:bg-[#603116] hover:text-white"
              >
                <span className="break-words [overflow-wrap:anywhere]">{featuredSupportLink.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            )}
          </aside>
        </div>
      </section>

      <div className="bg-[#3A2115] text-[#F4EBDD]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} TRIA CAFE. Cà phê Việt &amp; giải pháp pha chế hiện đại.</p>
          {bottomPolicyLinks.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {bottomPolicyLinks.map((item) => (
                <Link key={item.id} href={item.href} className="hover:text-white">{item.label}</Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
