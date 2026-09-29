"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export default function UserMenu({ onLogin }: { onLogin?: () => void }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape so keyboard users are not trapped.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-[#2A2421]" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        aria-label="Đăng nhập"
        onClick={onLogin}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#B9A99B] transition-colors hover:bg-[#2A2421] hover:text-white"
      >
        <UserRound className="h-4 w-4" />
      </button>
    );
  }

  const user = session.user;
  const displayName = user.name || "Thành viên";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Tài khoản: ${displayName}`}
        className="flex items-center gap-2 rounded-full border border-[#3A302B] bg-[#221D1A] py-1 pl-1 pr-2 text-left"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={displayName}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C87D55] text-xs font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-24 truncate text-xs font-semibold text-white sm:block">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[#D97706]" aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-[#4A3B31] bg-[#FDFBF7] p-4 text-[#1C1613] shadow-2xl">
          <div className="border-b border-[#E8DED2] pb-3">
            <p className="font-bold">{displayName}</p>
            <p className="mt-1 text-xs text-[#D97706]">{user.badge}</p>
            <p className="mt-2 text-xs text-[#756A61]">{user.triaPoints} TRIA Points</p>
          </div>
          <div className="space-y-1 py-3 text-sm">
            <Link href="/cong-dong" className="block rounded-lg px-2 py-2 hover:bg-[#F1E9DF]">Bài viết của tôi</Link>
            <Link href="/san-pham" className="block rounded-lg px-2 py-2 hover:bg-[#F1E9DF]">Lịch sử đơn hàng</Link>
            {user.role === "CAFE_OWNER" && (
              <Link href="/he-thong-quan" className="block rounded-lg px-2 py-2 hover:bg-[#F1E9DF]">Bảng giá sỉ B2B</Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin" className="block rounded-lg px-2 py-2 hover:bg-[#F1E9DF]">Quản trị hệ thống</Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 border-t border-[#E8DED2] pt-3 text-sm font-bold text-red-700"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}