"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { useFormStatus } from "react-dom";
import { Facebook, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { loginAction, registerAction } from "../../app/actions/auth";

type AuthModalProps = { open: boolean; onClose: () => void; oauthEnabled: { google: boolean; facebook: boolean } };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-xl bg-[#D97706] py-3 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E] disabled:opacity-60">
      {pending ? "Đang xử lý..." : label}
    </button>
  );
}

export default function AuthModal({ open, onClose, oauthEnabled }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [mounted, setMounted] = useState(false);
  const [loginState, loginFormAction] = useActionState(loginAction, {});
  const [registerState, registerFormAction] = useActionState(registerAction, {});
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const hasHandledRegisterRedirect = useRef(false);

  useEffect(() => setMounted(true), []);

  // When registration succeeds, either we are already signed in (session will
  // hydrate) or we should move the user directly to the login tab so they
  // don't have to discover it. The modal pre-fills the email they just used.
  useEffect(() => {
    if (!registerState.success || hasHandledRegisterRedirect.current) return;
    const email = registerState.createdEmail;
    if (email) setPrefilledEmail(email);
    if (registerState.autoLoggedIn) {
      onClose();
      window.location.reload();
    } else {
      hasHandledRegisterRedirect.current = true;
      setMode("login");
    }
  }, [registerState.success, registerState.createdEmail, registerState.autoLoggedIn, onClose]);

  // Successful credentials login should close the modal and return the user to
  // the page they initiated sign-in from. `signIn(..., { redirect: false })`
  // in the server action creates the session; a router.refresh lets layouts
  // pick up the new badge/points immediately.
  useEffect(() => {
    if (!loginState.success) return;
    const timer = window.setTimeout(() => {
      onClose();
      window.location.reload();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [loginState.success, onClose]);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    hasHandledRegisterRedirect.current = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  const state = mode === "login" ? loginState : registerState;
  const showOauth = oauthEnabled.google || oauthEnabled.facebook;

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Đăng nhập hoặc đăng ký">
      <div className="mx-auto my-10 max-w-md rounded-2xl border border-[#4A3B31] bg-[#FDFBF7] p-6 text-[#1C1613] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{mode === "login" ? "Chào mừng trở lại" : "Gia nhập TRIA Community"}</h2>
            <p className="mt-1 text-xs text-[#756A61]">
              {mode === "login" ? "Đăng nhập để bình luận, bỏ phiếu và tích điểm TRIA." : "Tạo tài khoản miễn phí để tham gia cộng đồng."}
            </p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-2 text-[#756A61] hover:bg-[#F1E9DF]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#F1E9DF] p-1 text-sm font-bold">
          <button type="button" onClick={() => setMode("login")} aria-pressed={mode === "login"} className={`rounded-lg py-2 transition ${mode === "login" ? "bg-white shadow-sm" : "text-[#756A61]"}`}>
            Đăng nhập
          </button>
          <button type="button" onClick={() => setMode("register")} aria-pressed={mode === "register"} className={`rounded-lg py-2 transition ${mode === "register" ? "bg-white shadow-sm" : "text-[#756A61]"}`}>
            Đăng ký
          </button>
        </div>

        {showOauth && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {oauthEnabled.google && (
                <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="flex items-center justify-center gap-2 rounded-xl border border-[#D8CDC2] py-2.5 text-xs font-bold transition hover:bg-[#F1E9DF]">
                  <Mail className="h-4 w-4 text-[#D97706]" aria-hidden /> Google
                </button>
              )}
              {oauthEnabled.facebook && (
                <button type="button" onClick={() => signIn("facebook", { callbackUrl: "/" })} className="flex items-center justify-center gap-2 rounded-xl border border-[#D8CDC2] py-2.5 text-xs font-bold transition hover:bg-[#F1E9DF]">
                  <Facebook className="h-4 w-4 text-[#D97706]" aria-hidden /> Facebook
                </button>
              )}
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-[#A69B93]">
              <span className="h-px flex-1 bg-[#E8DED2]" /> hoặc email <span className="h-px flex-1 bg-[#E8DED2]" />
            </div>
          </>
        )}

        {mode === "login" ? (
          <form action={loginFormAction} className="space-y-3">
            <label className="block text-xs font-bold">
              Email
              <input name="email" type="email" required autoComplete="email" value={prefilledEmail} onChange={(event) => setPrefilledEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-[#D8CDC2] px-4 py-3 font-normal outline-none focus:border-[#D97706]" placeholder="you@example.com" />
            </label>
            <label className="block text-xs font-bold">
              Mật khẩu
              <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-[#D8CDC2] px-4 py-3 font-normal outline-none focus:border-[#D97706]" placeholder="••••••••" />
            </label>
            {state.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}
            {state.success && <p role="status" className="text-xs text-emerald-700">{state.success}</p>}
            <SubmitButton label="Đăng nhập" />
          </form>
        ) : (
          <form action={registerFormAction} className="space-y-3">
            <label className="block text-xs font-bold">
              Họ và tên
              <span className="relative block">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69B93]" aria-hidden />
                <input name="name" required maxLength={120} autoComplete="name" className="mt-1 w-full rounded-xl border border-[#D8CDC2] py-3 pl-10 pr-4 font-normal outline-none focus:border-[#D97706]" placeholder="Nguyễn Văn A" />
              </span>
            </label>
            <label className="block text-xs font-bold">
              Email
              <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-[#D8CDC2] px-4 py-3 font-normal outline-none focus:border-[#D97706]" placeholder="you@example.com" />
            </label>
            <label className="block text-xs font-bold">
              Mật khẩu
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69B93]" aria-hidden />
                <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-1 w-full rounded-xl border border-[#D8CDC2] py-3 pl-10 pr-4 font-normal outline-none focus:border-[#D97706]" placeholder="Tối thiểu 8 ký tự" />
              </span>
            </label>
            <label className="block text-xs font-bold">
              Bạn là
              <select name="accountType" className="mt-1 w-full rounded-xl border border-[#D8CDC2] px-4 py-3 font-normal outline-none focus:border-[#D97706]">
                <option value="personal">Cá nhân yêu cà phê</option>
                <option value="business">Chủ quán / Doanh nghiệp F&amp;B</option>
              </select>
            </label>
            {state.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}
            {state.success && <p role="status" className="text-xs text-emerald-700">{state.success}</p>}
            <SubmitButton label="Tạo tài khoản" />
          </form>
        )}

        <p className="mt-5 text-center text-[11px] text-[#A69B93]">
          Bằng việc đăng ký, bạn đồng ý với <a href="/phap-ly/dieu-khoan" target="_blank" rel="noreferrer" className="font-semibold text-[#D97706] hover:underline">Điều khoản sử dụng</a> và <a href="/phap-ly/bao-mat" target="_blank" rel="noreferrer" className="font-semibold text-[#D97706] hover:underline">Chính sách bảo mật</a> của TRIA CAFE.
        </p>
      </div>
    </div>,
    document.body
  );
}
