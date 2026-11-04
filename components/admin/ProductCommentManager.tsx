"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";

export type ProductComment = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string | null; email: string };
  product: { name: string; slug: string };
};

type CommentsResponse = { comments: ProductComment[]; total: number; error?: string };

export default function ProductCommentManager({ onNewComments }: { onNewComments: (comments: ProductComment[]) => void }) {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const previousCommentIds = useRef<Set<string> | null>(null);
  const requestInFlight = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const response = await fetch("/api/admin/product-comments", { cache: "no-store" });
      const payload = await response.json() as CommentsResponse;
      if (!response.ok) throw new Error(payload.error || "Không tải được bình luận sản phẩm.");
      const currentIds = new Set(payload.comments.map((comment) => comment.id));
      if (previousCommentIds.current) {
        const newComments = payload.comments.filter((comment) => !previousCommentIds.current?.has(comment.id));
        if (newComments.length) onNewComments(newComments);
      }
      previousCommentIds.current = currentIds;
      setComments(payload.comments);
      setTotal(payload.total);
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Không tải được bình luận sản phẩm.");
    } finally {
      requestInFlight.current = false;
      if (!silent) setLoading(false);
    }
  }, [onNewComments]);

  useEffect(() => {
    void load();
    const intervalId = window.setInterval(() => { void load(true); }, 5000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2421] p-5">
        <div>
          <h2 className="text-xl font-bold text-white">Bình luận sản phẩm</h2>
          <p className="mt-1 text-xs text-[#81746B]">{total} bình luận · hiển thị tối đa 100 bình luận mới nhất</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#3A302B] px-3 py-2 text-sm text-[#CDBBAA] hover:border-[#D97706] disabled:opacity-50">
          <RefreshCw className="h-4 w-4" aria-hidden /> Làm mới
        </button>
      </div>
      {error && <p role="alert" className="m-5 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">{error}</p>}
      {loading && !comments.length ? <p className="p-8 text-sm text-[#81746B]">Đang tải bình luận...</p> : comments.length ? (
        <div className="divide-y divide-[#2A2421]">
          {comments.map((comment) => (
            <article key={comment.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,2fr)]">
              <div>
                <p className="text-sm font-bold text-white">{comment.product.name}</p>
                <p className="mt-1 text-xs text-[#A69B93]">{comment.author.name || "Thành viên"} · {comment.author.email}</p>
                <time className="mt-1 block text-xs text-[#81746B]" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString("vi-VN")}</time>
              </div>
              <div className="flex gap-2 text-sm leading-relaxed text-[#D8CDC2]">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden />
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            </article>
          ))}
        </div>
      ) : !loading && <p className="p-8 text-sm text-[#81746B]">Chưa có bình luận sản phẩm.</p>}
    </section>
  );
}