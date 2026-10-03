import Image from "next/image";
import Link from "next/link";
import { BRANCHES, HOTLINE, HOTLINE_MOBILE, NAV_ITEMS, PRODUCT_CATEGORIES } from "../../lib/site-data";

export default function Footer() {
  return (
    <footer className="border-t border-[#2A2421] bg-[#171412] py-12 text-xs text-[#A69B93]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Image
            src="/images/tria_logo.png"
            alt="TRIA CAFE"
            width={160}
            height={36}
            loading="lazy"
            className="h-auto w-40 object-contain"
          />
          <p className="leading-relaxed">
            Thương hiệu Cà phê Việt &amp; Hệ sinh thái Giải pháp Máy pha chuyên nghiệp cho B2C và B2B.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Trải Nghiệm Tại TP.HCM</h2>
          <ul className="space-y-2">
            {BRANCHES.map((branch) => (
              <li key={branch.id}>
                <Link
                  href={`/he-thong-quan#${branch.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {branch.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Pháp lý &amp; Quy định</h2>
          <ul className="space-y-1.5">
            <li><Link href="/phap-ly/dieu-khoan" className="transition-colors hover:text-white">Điều khoản sử dụng</Link></li>
            <li><Link href="/phap-ly/bao-mat" className="transition-colors hover:text-white">Chính sách bảo mật</Link></li>
            <li><Link href="/phap-ly/cong-dong" className="transition-colors hover:text-white">Quy định cộng đồng</Link></li>
            <li><Link href="/phap-ly/quyen-loi" className="transition-colors hover:text-white">Quyền lợi &amp; trách nhiệm</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Sản Phẩm Cốt Lõi</h2>
          <ul className="space-y-1.5">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/san-pham?category=${category.id}`}
                  className="transition-colors hover:text-white"
                >
                  {category.title} - {category.subtitle}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-1.5">
            {NAV_ITEMS.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Hotline &amp; Hỗ Trợ Kỹ Thuật</h2>
          <p className="mb-1 text-base font-bold text-[#E2A168]">
            <a href={`tel:${HOTLINE.replace(/\s/g, "")}`}>{HOTLINE}</a>
            {" / "}
            <a href={`tel:${HOTLINE_MOBILE.replace(/\s/g, "")}`}>{HOTLINE_MOBILE}</a>
          </p>
          <p>Hỗ trợ bảo trì tận nơi cho khách hàng B2B 24/7</p>
          <p className="mt-2">
            <a href="mailto:hello@triacafe.vn" className="transition-colors hover:text-white">
              hello@triacafe.vn
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-[#2A2421] px-4 pt-6 text-center sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} TRIA CAFE. Cà phê Việt &amp; giải pháp pha chế hiện đại.</p>
      </div>
    </footer>
  );
}
