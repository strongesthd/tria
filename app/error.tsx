"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Replace with a real reporting sink (Sentry, etc.) in production.
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-[#2A2421] bg-[#171412] p-8 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-[#C87D55]" aria-hidden />
        <h1 className="mt-4 text-xl font-bold text-white">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-[#A69B93]">
          Chúng tôi không thể tải nội dung này. Vui lòng thử lại sau ít phút.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-[#C87D55] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A85C38]"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
