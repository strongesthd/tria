"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AuthModal from "../auth/AuthModal";

/**
 * Shown at /admin when there is no session at all. Instead of silently
 * bouncing the visitor to the homepage, offer the site-wide login modal and
 * reload after a successful credentials sign-in so the server can render the
 * dashboard.
 */
export default function AdminLoginGate({
  oauthEnabled,
}: {
  oauthEnabled: { google: boolean; facebook: boolean };
}) {
  const [open, setOpen] = useState(false);
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#3A302B] bg-[#171412] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D97706]/15">
          <ShieldCheck className="h-7 w-7 text-[#D97706]" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-white">Khu vực quản trị TRIA</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A69B93]">
          Trang này chỉ dành cho tài khoản quản trị. Vui lòng đăng nhập để tiếp tục.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 w-full rounded-xl bg-[#D97706] py-3 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E]"
        >
          Đăng nhập quản trị
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} oauthEnabled={oauthEnabled} />
    </main>
  );
}
