"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus, MessageCircle, Smile, X, ArrowLeft } from "lucide-react";
import { CommunityPost, badgeFor } from "./types";

type PostDetailModalProps = { post: CommunityPost | null; onClose: () => void; onAddComment: (postId: string, body: string, parentId?: string) => void };

export function PostDetailModal({ post, onClose, onAddComment }: PostDetailModalProps) {
  if (!post) return null;

  const badge = badgeFor(post.author.badge);
  const authorName = post.author.name || "Thành viên TRIA";
  const avatar = post.author.image || "";

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={post.title}>
      <div className="mx-auto my-6 max-w-3xl overflow-hidden rounded-2xl border border-[#4A3B31] bg-[#171412] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#2A2421] px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">TRIA Knowledge Hub</span>
          <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="hidden items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#A69B93] hover:bg-[#2A2421] hover:text-white sm:flex"><ArrowLeft className="h-3.5 w-3.5" /> Quay lại</button>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-2 text-[#A69B93] hover:bg-[#2A2421] hover:text-white">
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>
        <div className="p-5 md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#D97706]/15 px-3 py-1 text-xs font-bold text-[#F0B429]">{post.categoryLabel}</span>
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#D97706]">{tag}</span>
            ))}
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-white md:text-3xl">{post.title}</h2>
          <div className="mt-4 flex items-center gap-3">
            {avatar ? (
              <Image src={avatar} alt={authorName} width={36} height={36} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-[#221D1A] text-xs font-bold text-[#E2A168]">{authorName.charAt(0)}</span>
            )}
            <div>
              <p className="text-sm font-bold text-white">
                {authorName} <span className={`ml-2 text-xs font-normal ${badge.tone}`}>{badge.icon} {badge.label}</span>
              </p>
              <p className="text-xs text-[#A69B93]">{post.time} · {post.views.toLocaleString("vi-VN")} lượt xem</p>
            </div>
          </div>
          {post.image && (
            <Image
              src={post.image}
              alt={`Hình minh họa: ${post.title}`}
              width={900}
              height={360}
              loading="lazy"
              className="mt-6 max-h-[360px] w-full rounded-xl object-cover"
            />
          )}
          <div className="prose prose-invert mt-6 max-w-none text-sm leading-7 text-[#D8CDC2]">
            <p>{post.content}</p>
          </div>

          <div className="mt-8 border-t border-[#2A2421] pt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4 text-[#D97706]" aria-hidden />
              Bình luận &amp; giải pháp ({post.comments})
            </h3>
            <div className="mt-4 space-y-4">
              {post.commentsData.filter((comment) => !comment.parentId).map((comment) => {
                const commentBadge = badgeFor(comment.badge.label);
                const replies = post.commentsData.filter((reply) => reply.parentId === comment.id);
                return (
                  <div key={comment.id}>
                  <div className="flex gap-3 rounded-xl bg-[#221D1A] p-4">
                    {comment.avatar ? (
                      <Image src={comment.avatar} alt={comment.author} width={32} height={32} loading="lazy" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171412] text-xs font-bold text-[#E2A168]">{comment.author.charAt(0)}</span>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{comment.author}</span>
                        <span className={`text-xs ${commentBadge.tone}`}>{commentBadge.icon} {commentBadge.label}</span>
                        {comment.accepted && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Giải pháp chuẩn
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#CDBBAA]">{comment.body}</p>
                      <div className="mt-2 flex items-center gap-3"><p className="text-[11px] text-[#81746B]">{comment.time}</p><ReplyForm postId={post.id} parentId={comment.id} onSubmit={onAddComment} /></div>
                    </div>
                  </div>
                  {replies.map((reply) => <div key={reply.id} className="ml-10 mt-2 flex gap-3 rounded-xl border-l-2 border-[#D97706]/50 bg-[#211D1A] p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171412] text-xs font-bold text-[#E2A168]">{reply.author.charAt(0)}</span><div><p className="text-xs font-bold text-white">{reply.author} <span className={`ml-1 font-normal ${reply.badge.tone}`}>{reply.badge.icon} {reply.badge.label}</span></p><p className="mt-1 text-sm text-[#CDBBAA]">{reply.body}</p><p className="mt-1 text-[10px] text-[#81746B]">{reply.time}</p></div></div>)}
                  </div>
                );
              })}
            </div>
            <CommentForm onSubmit={(body) => onAddComment(post.id, body)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyForm({ postId, parentId, onSubmit }: { postId: string; parentId: string; onSubmit: (postId: string, body: string, parentId: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState("");
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-[11px] font-bold text-[#D97706] hover:underline">Trả lời</button>;
  return <form onSubmit={(event) => { event.preventDefault(); if (!body.trim()) return; onSubmit(postId, body.trim(), parentId); setBody(""); setOpen(false); }} className="mt-2 flex w-full gap-2"><div className="flex min-w-0 flex-1 items-center gap-1 rounded-lg border border-[#3A302B] bg-[#171412] px-2"><button type="button" aria-label="Thêm emoji" className="text-[#D97706]"><Smile className="h-3.5 w-3.5" /></button><input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Trả lời bình luận..." className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs text-white outline-none" /><button type="button" aria-label="Đính kèm ảnh" className="text-[#A69B93] hover:text-[#D97706]"><ImagePlus className="h-3.5 w-3.5" /></button></div><button type="submit" className="rounded-lg bg-[#D97706] px-3 text-xs font-bold text-[#1C1613]">Gửi</button></form>;
}

function CommentForm({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [body, setBody] = React.useState("");
  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!body.trim()) return;
        onSubmit(body.trim());
        setBody("");
      }}
    >
      <label className="sr-only" htmlFor="community-comment-input">
        Viết bình luận
      </label>
      <div className="flex gap-2">
        <input
          id="community-comment-input"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Chia sẻ kinh nghiệm hoặc câu hỏi..."
          className="min-w-0 flex-1 rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm text-white outline-none focus:border-[#D97706]"
        />
        <div className="flex gap-2">
          <button type="button" aria-label="Thêm emoji" className="rounded-xl border border-[#3A302B] p-3 text-[#D97706] hover:bg-[#2A2421]"><Smile className="h-4 w-4" /></button>
          <button type="button" aria-label="Đính kèm ảnh" className="rounded-xl border border-[#3A302B] p-3 text-[#A69B93] hover:bg-[#2A2421] hover:text-[#D97706]"><ImagePlus className="h-4 w-4" /></button>
          <button type="submit" className="rounded-xl bg-[#D97706] px-4 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E]">
          Gửi
        </button>
        </div>
      </div>
    </form>
  );
}
