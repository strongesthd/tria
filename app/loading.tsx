export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-[#A69B93]">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#332A25] border-t-[#C87D55]" aria-hidden />
        <p className="text-sm">Đang tải…</p>
      </div>
    </div>
  );
}
