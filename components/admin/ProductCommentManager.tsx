"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Reply, Send, Trash2, X } from "lucide-react";

type ProductComment = {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author: { name: string | null; email: string | null; role: string };
  product: { name: string; slug: string };
};

type CommentsResponse = { comments: ProductComment[]; total: number; error?: string };

export default function ProductCommentManager() {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/product-comments", { cache: "no-store" });
      const payload = await response.json() as CommentsResponse;
      if (!response.ok) throw new Error(payload.error || "Không tải được bình luận sản phẩm.");
      setComments(payload.comments);
      setTotal(payload.total);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được bình luận sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submitReply(event: FormEvent<HTMLFormElement>, parentId: string) {
    event.preventDefault();
    setBusyId(parentId);
    setError("");
    try {
      const response = await fetch("/api/admin/product-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, content: replyContent }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Không thể gửi phản hồi.");
      setReplyContent("");
      setReplyingTo(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi phản hồi.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteComment(id: string) {
    if (!window.confirm("Xóa bình luận này?")) return;
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/product-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Không thể xóa bình luận.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa bình luận.");
    } finally {
      setBusyId("");
    }
  }

  function authorName(comment: ProductComment) {
    return comment.author.role === "ADMIN" ? "TRIA Admin" : comment.author.name || comment.author.email || "Thành viên";
  }

  function renderComment(comment: ProductComment, isReply = false) {
    return (
      <div key={comment.id} className={`${isReply ? "border-t border-[#2A2421] pl-4 sm:pl-8" : ""} grid gap-3 p-5 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(0,2fr)_auto]`}>
        <div>
          <p className="text-sm font-bold text-white">{authorName(comment)}</p>
          <p className="mt-1 text-xs text-[#A69B93]">{comment.product.name}</p>
          <time className="mt-1 block text-xs text-[#81746B]" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString("vi-VN")}</time>
        </div>
        <div className="flex gap-2 text-sm leading-relaxed text-[#D8CDC2]">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden />
          <p className="whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="flex items-start gap-2">
          {!isReply && <button type="button" title="Phản hồi" aria-label="Phản hồi bình luận" onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(""); }} className="rounded-lg border border-[#3A302B] p-2 text-[#CDBBAA] hover:border-[#D97706] hover:text-white"><Reply className="h-4 w-4" aria-hidden /></button>}
          <button type="button" title="Xóa bình luận" aria-label="Xóa bình luận" disabled={busyId === comment.id} onClick={() => void deleteComment(comment.id)} className="rounded-lg border border-red-900/50 p-2 text-red-400 hover:bg-red-950/30 disabled:opacity-50"><Trash2 className="h-4 w-4" aria-hidden /></button>
        </div>
        {!isReply && replyingTo === comment.id && (
          <form onSubmit={(event) => void submitReply(event, comment.id)} className="space-y-2 sm:col-start-2 sm:col-span-2">
            <textarea autoFocus value={replyContent} onChange={(event) => setReplyContent(event.target.value)} maxLength={5000} required rows={3} placeholder="Nhập phản hồi từ TRIA..." className="w-full rounded-lg border border-[#3A302B] bg-[#221D1A] p-3 text-sm text-white outline-none focus:border-[#D97706]" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReplyingTo(null)} className="inline-flex items-center gap-1 rounded-lg border border-[#3A302B] px-3 py-2 text-xs text-[#CDBBAA]"><X className="h-3.5 w-3.5" aria-hidden /> Hủy</button>
              <button type="submit" disabled={busyId === comment.id} className="inline-flex items-center gap-1 rounded-lg bg-[#D97706] px-3 py-2 text-xs font-bold text-[#1C1613] disabled:opacity-50"><Send className="h-3.5 w-3.5" aria-hidden /> Gửi phản hồi</button>
            </div>
          </form>
        )}
      </div>
    );
  }

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
          {comments.filter((comment) => !comment.parentId).map((comment) => (
            <article key={comment.id}>
              {renderComment(comment)}
              {comments.filter((reply) => reply.parentId === comment.id).sort((left, right) => left.createdAt.localeCompare(right.createdAt)).map((reply) => renderComment(reply, true))}
            </article>
          ))}
        </div>
      ) : !loading && <p className="p-8 text-sm text-[#81746B]">Chưa có bình luận sản phẩm.</p>}
    </section>
  );
}