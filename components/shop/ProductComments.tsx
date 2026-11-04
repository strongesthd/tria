"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ProductComment = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string | null; image: string | null };
};

type CommentsResponse = { comments: ProductComment[]; total: number };

export default function ProductComments({ productId, onCountChange }: { productId: string; onCountChange?: (count: number) => void }) {
  const { status } = useSession();
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [total, setTotal] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/comments`, { cache: "no-store" });
      if (!response.ok) throw new Error("Không tải được bình luận.");
      const payload = await response.json() as CommentsResponse;
      setComments(payload.comments);
      setTotal(payload.total);
      onCountChange?.(payload.total);
    } finally {
      setLoading(false);
    }
  }, [onCountChange, productId]);

  useEffect(() => { void load().catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được bình luận.")); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await response.json() as ProductComment | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error || "Không thể gửi bình luận." : "Không thể gửi bình luận.");
      setComments((current) => [payload as ProductComment, ...current]);
      setTotal(total + 1);
      onCountChange?.(total + 1);
      setContent("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi bình luận.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {status === "authenticated" ? (
        <form onSubmit={(event) => void submit(event)} className="space-y-3">
          <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} required rows={4} placeholder="Chia sẻ trải nghiệm hoặc câu hỏi của bạn..." className="w-full rounded-xl border border-[#3A302B] bg-[#221D1A] p-3 text-sm text-white outline-none focus:border-[#D97706]" />
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={busy || loading} className="rounded-xl bg-[#D97706] px-4 py-2 text-sm font-bold text-[#1C1613] disabled:opacity-50">{busy ? "Đang gửi..." : loading ? "Đang tải..." : "Gửi bình luận"}</button>
        </form>
      ) : (
        <p className="text-sm text-[#A69B93]">Vui lòng đăng nhập để bình luận sản phẩm.</p>
      )}
      {status !== "loading" && error && status !== "authenticated" && <p role="alert" className="text-xs text-red-400">{error}</p>}
      {comments.length ? comments.map((comment) => (
        <article key={comment.id} className="border-t border-[#2A2421] pt-4">
          <p className="text-xs font-bold text-[#E2A168]">{comment.author.name || "Thành viên"}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#D8CDC2]">{comment.content}</p>
          <time className="mt-2 block text-[11px] text-[#81746B]" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</time>
        </article>
      )) : <p className="text-sm text-[#81746B]">Chưa có bình luận nào.</p>}
    </div>
  );
}
