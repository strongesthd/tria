"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, Coffee, MapPin, MessageSquare, Calculator, Search, ShoppingBag, X, Handshake } from "lucide-react";
import { Menu } from "lucide-react";
import AuthHeaderActions from "../auth/AuthHeaderActions";
import { useCart } from "../cart/CartProvider";
import { NAV_ITEMS } from "../../lib/site-data";

const ICONS = {
  "/san-pham": Coffee,
  "/cong-dong": MessageSquare,
  "/he-thong-quan": MapPin,
  "/giai-phap-b2b": Calculator,
  "/hop-tac": Handshake,
} as const;

export default function Header({
  oauthEnabled = { google: false, facebook: false },
}: {
  oauthEnabled?: { google: boolean; facebook: boolean };
}) {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] border-b border-[#2A2421] bg-[#171412]/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-3 sm:px-6 lg:gap-4 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 flex-col items-center justify-center transition-opacity hover:opacity-95"
          aria-label="TRIA CAFE - Trang chủ"
        >
          <Image
            src="/images/tria_logo.png"
            alt="TRIA CAFE"
            width={210}
            height={47}
            priority
            className="h-auto w-[118px] object-contain sm:w-[190px] lg:w-[210px]"
          />
          <span className="mt-1 hidden text-center text-[8px] font-medium uppercase tracking-[0.12em] text-[#B9A99B] sm:block">
            Cà Phê Việt &amp; Giải Pháp Pha Chế
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-[#332A25] bg-[#221D1A]/95 p-1.5 shadow-inner shadow-[#000000]/20 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.href as keyof typeof ICONS] ?? Coffee;
            if (item.href === "/hop-tac") {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition-all xl:px-5 ${
                      isActive(item.href) ? "bg-[#C87D55] text-white shadow-md shadow-[#C87D55]/20" : "text-[#A69B93] hover:bg-[#2A2421] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.shortLabel}</span>
                  </Link>
                  <div className="invisible absolute right-0 top-full z-50 w-64 translate-y-2 rounded-xl border border-[#3A302B] bg-[#171412] p-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                    <Link href="/hop-tac#mo-hinh" className="block rounded-lg px-3 py-2 text-xs text-[#B9A99B] hover:bg-[#2A2421] hover:text-white">Mô hình TRIA On-The-Go</Link>
                    <Link href="/hop-tac#ban-do" className="block rounded-lg px-3 py-2 text-xs text-[#B9A99B] hover:bg-[#2A2421] hover:text-white">Bản đồ điểm bán</Link>
                    <Link href="/hop-tac#dang-ky" className="block rounded-lg px-3 py-2 text-xs text-[#B9A99B] hover:bg-[#2A2421] hover:text-white">Đăng ký hợp tác</Link>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition-all xl:px-5 ${
                  isActive(item.href)
                    ? "bg-[#C87D55] text-white shadow-md shadow-[#C87D55]/20"
                    : "text-[#A69B93] hover:bg-[#2A2421] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center space-x-2 sm:space-x-3">
          <Link
            href="/san-pham"
            aria-label="Tìm kiếm sản phẩm"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#B9A99B] transition-colors hover:bg-[#2A2421] hover:text-white sm:flex"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
            className="relative hidden h-9 w-9 items-center justify-center rounded-full text-[#B9A99B] transition-colors hover:bg-[#2A2421] hover:text-white sm:flex"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D97706] px-1 text-[9px] font-bold text-[#1C1613]">
                {count}
              </span>
            )}
          </button>
          <div className="hidden sm:block">
            <AuthHeaderActions oauthEnabled={oauthEnabled} />
          </div>
          <Link
            href="/he-thong-quan#booking"
            className="hidden items-center space-x-2 rounded-xl border border-[#C87D55]/30 bg-[#2A2421] px-4 py-2 text-sm font-medium text-[#E2A168] transition-all hover:bg-[#38302C] sm:flex"
          >
            <Calendar className="h-4 w-4" aria-hidden />
            <span>Đặt lịch demo</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileNavOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#B9A99B] transition-colors hover:bg-[#2A2421] hover:text-white md:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav aria-label="Điều hướng di động" className="border-t border-[#2A2421] bg-[#171412] px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#A69B93] transition-colors hover:bg-[#2A2421] hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-[#2A2421] pt-2">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D97706]">Hợp tác điểm bán</p>
              <Link href="/hop-tac#mo-hinh" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#A69B93] hover:bg-[#2A2421] hover:text-white">Mô hình TRIA On-The-Go</Link>
              <Link href="/hop-tac#ban-do" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#A69B93] hover:bg-[#2A2421] hover:text-white">Bản đồ điểm bán</Link>
              <Link href="/hop-tac#dang-ky" onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#A69B93] hover:bg-[#2A2421] hover:text-white">Đăng ký hợp tác</Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#A69B93] transition-colors hover:bg-[#2A2421] hover:text-white"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden /> Giỏ hàng ({count})
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
