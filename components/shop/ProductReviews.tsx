"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";

type ProductReview = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  author: { name: string | null; image: string | null };
};

type ReviewsResponse = {
  reviews: ProductReview[];
  total: number;
  average: number;
  currentReview: { id: string; rating: number; content: string } | null;
};

export default function ProductReviews({ productId, initialCount, onCountChange }: { productId: string; initialCount: number; onCountChange: (count: number) => void }) {
  const { status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, { cache: "no-store" });
      if (!response.ok) throw new Error("Không tải được đánh giá.");
      const payload = await response.json() as ReviewsResponse;
      setReviews(payload.reviews);
      setTotal(payload.total);
      setAverage(payload.average);
      onCountChange(payload.total);
      if (payload.currentReview) {
        setCurrentReviewId(payload.currentReview.id);
        setRating(payload.currentReview.rating);
        setContent(payload.currentReview.content);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được đánh giá.");
    } finally {
      setLoading(false);
    }
  }, [onCountChange, productId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content }),
      });
      const payload = await response.json() as { error?: string; total?: number; average?: number };
      if (!response.ok) throw new Error(payload.error || "Không thể gửi đánh giá.");
      if (typeof payload.total === "number") {
        setTotal(payload.total);
        onCountChange(payload.total);
      }
      if (typeof payload.average === "number") setAverage(payload.average);
      setCurrentReviewId("saved");
      await load();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi đánh giá.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2 border-b border-[#2A2421] pb-5">
        <p className="text-4xl font-extrabold text-white">{average ? average.toFixed(1) : "—"}</p>
        <div>
          <div className="flex gap-1" aria-label={`${average.toFixed(1)} trên 5 sao`}>
            {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= Math.round(average) ? "fill-current text-amber-400" : "text-[#5A5049]"}`} aria-hidden />)}
          </div>
          <p className="mt-1 text-xs text-[#A69B93]">{total} đánh giá</p>
        </div>
      </div>

      {status === "authenticated" ? (
        <form onSubmit={(event) => void submit(event)} className="space-y-3 border-b border-[#2A2421] pb-6">
          <div>
            <p className="text-sm font-bold text-white">{currentReviewId ? "Cập nhật đánh giá của bạn" : "Đánh giá sản phẩm"}</p>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} sao`} onClick={() => setRating(value)} disabled={loading || busy} className="rounded p-1 disabled:opacity-50">
                  <Star className={`h-6 w-6 ${value <= rating ? "fill-current text-amber-400" : "text-[#5A5049]"}`} aria-hidden />
                </button>
              ))}
            </div>
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={3} maxLength={2000} required rows={3} placeholder="Chia sẻ trải nghiệm thực tế của bạn..." className="w-full rounded-xl border border-[#3A302B] bg-[#221D1A] p-3 text-sm text-white outline-none focus:border-[#D97706]" />
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={busy || loading} className="rounded-lg bg-[#D97706] px-4 py-2 text-sm font-bold text-[#1C1613] disabled:opacity-50">{busy ? "Đang gửi..." : currentReviewId ? "Cập nhật đánh giá" : "Gửi đánh giá"}</button>
        </form>
      ) : <p className="border-b border-[#2A2421] pb-5 text-sm text-[#A69B93]">Vui lòng đăng nhập để đánh giá sản phẩm.</p>}

      {loading && !reviews.length ? <p className="text-sm text-[#81746B]">Đang tải đánh giá...</p> : reviews.length ? (
        <div className="space-y-5">
          {reviews.map((review) => (
            <article key={review.id} className="border-b border-[#2A2421] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#E2A168]">{review.author.name || "Thành viên"}</p>
                <time className="text-xs text-[#81746B]" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</time>
              </div>
              <div className="mt-1 flex gap-1" aria-label={`${review.rating} trên 5 sao`}>
                {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3.5 w-3.5 ${value <= review.rating ? "fill-current text-amber-400" : "text-[#5A5049]"}`} aria-hidden />)}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#D8CDC2]">{review.content}</p>
            </article>
          ))}
        </div>
      ) : !loading && <p className="text-sm text-[#81746B]">Sản phẩm chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</p>}
    </div>
  );
}