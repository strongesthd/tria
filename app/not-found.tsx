import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-[7rem] font-extrabold leading-none text-[#C87D55]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Không tìm thấy trang bạn cần</h1>
        <p className="mt-3 text-sm text-[#A69B93]">
          Trang này có thể đã được di chuyển hoặc không còn tồn tại. Hãy quay lại trang chủ để tiếp tục.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-xl bg-[#C87D55] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A85C38]">
            Về trang chủ
          </Link>
          <Link href="/san-pham" className="rounded-xl border border-[#3A302B] bg-[#221D1A] px-6 py-3 text-sm font-bold text-[#E2A168] transition hover:bg-[#2A2421]">
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
