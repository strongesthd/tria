"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Star, Trash2 } from "lucide-react";

type ProductReview = {
  id: string;
  rating: number;
  content: string;
  updatedAt: string;
  author: { name: string | null; email: string | null };
  product: { name: string };
};

type ReviewsResponse = { reviews: ProductReview[]; total: number; error?: string };

export default function ProductReviewManager() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/product-reviews", { cache: "no-store" });
      const payload = await response.json() as ReviewsResponse;
      if (!response.ok) throw new Error(payload.error || "Không tải được đánh giá.");
      setReviews(payload.reviews);
      setTotal(payload.total);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được đánh giá.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function removeReview(id: string) {
    if (!window.confirm("Xóa đánh giá này? Điểm trung bình sản phẩm sẽ được tính lại.")) return;
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/product-reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Không thể xóa đánh giá.");
      setReviews((current) => current.filter((review) => review.id !== id));
      setTotal((current) => Math.max(0, current - 1));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa đánh giá.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2421] p-5">
        <div>
          <h2 className="text-xl font-bold text-white">Đánh giá sản phẩm</h2>
          <p className="mt-1 text-xs text-[#81746B]">{total} đánh giá · hiển thị tối đa 100 mới nhất</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#3A302B] px-3 py-2 text-sm text-[#CDBBAA] hover:border-[#D97706] disabled:opacity-50">
          <RefreshCw className="h-4 w-4" aria-hidden /> Làm mới
        </button>
      </div>
      {error && <p role="alert" className="m-5 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">{error}</p>}
      {loading && !reviews.length ? <p className="p-8 text-sm text-[#81746B]">Đang tải đánh giá...</p> : reviews.length ? (
        <div className="divide-y divide-[#2A2421]">
          {reviews.map((review) => (
            <article key={review.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,2fr)_auto]">
              <div>
                <p className="text-sm font-bold text-white">{review.product.name}</p>
                <p className="mt-1 text-xs text-[#A69B93]">{review.author.name || review.author.email || "Thành viên"}</p>
                <time className="mt-1 block text-xs text-[#81746B]" dateTime={review.updatedAt}>{new Date(review.updatedAt).toLocaleString("vi-VN")}</time>
              </div>
              <div>
                <div className="flex gap-1" aria-label={`${review.rating} trên 5 sao`}>
                  {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3.5 w-3.5 ${value <= review.rating ? "fill-current text-amber-400" : "text-[#5A5049]"}`} aria-hidden />)}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#D8CDC2]">{review.content}</p>
              </div>
              <button type="button" aria-label="Xóa đánh giá" title="Xóa đánh giá" disabled={busyId === review.id} onClick={() => void removeReview(review.id)} className="h-fit rounded-lg border border-red-900/50 p-2 text-red-400 hover:bg-red-950/30 disabled:opacity-50">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </article>
          ))}
        </div>
      ) : !loading && <p className="p-8 text-sm text-[#81746B]">Chưa có đánh giá sản phẩm.</p>}
    </section>
  );
}