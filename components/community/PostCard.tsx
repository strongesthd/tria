"use client";

import Image from "next/image";
import { Bookmark, Eye, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { CommunityPost, badgeFor } from "./types";

type PostCardProps = {
  post: CommunityPost;
  onOpen: (post: CommunityPost) => void;
  onVote: (id: string, direction: "up" | "down") => void;
  saved: boolean;
  onSave: (id: string) => void;
};

export function PostCard({ post, onOpen, onVote, saved, onSave }: PostCardProps) {
  const badge = badgeFor(post.author.badge);
  const authorName = post.author.name || "Thành viên TRIA";
  const avatar = post.author.image || "";

  return (
    <article className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412] transition hover:border-[#D97706]/70">
      {post.image && (
        <button type="button" onClick={() => onOpen(post)} className="block w-full overflow-hidden text-left">
          <Image
            src={post.image}
            alt={`Hình minh họa cho bài viết: ${post.title}`}
            width={900}
            height={400}
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="h-48 w-full object-cover transition duration-500 hover:scale-105"
          />
        </button>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <Image src={avatar} alt={authorName} width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full border border-[#D97706]/50 object-cover" />
            ) : (
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D97706]/50 bg-[#221D1A] text-sm font-bold text-[#E2A168]">
                {authorName.charAt(0)}
              </span>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white">{authorName}</span>
                <span className={`text-xs font-semibold ${badge.tone}`}>{badge.icon} {badge.label}</span>
              </div>
              <p className="text-xs text-[#A69B93]">{post.time} · +{post.points} TRIA Points</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={saved ? `Bỏ lưu bài viết: ${post.title}` : `Lưu bài viết: ${post.title}`}
            aria-pressed={saved}
            onClick={() => onSave(post.id)}
            className={`rounded-lg p-2 ${saved ? "text-[#D97706]" : "text-[#A69B93] hover:text-white"}`}
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#D97706]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F0B429]">{post.categoryLabel}</span>
          <span className="rounded-full border border-[#4A3B31] px-2.5 py-1 text-[10px] text-[#CDBBAA]">{post.status}</span>
          {post.tags.map((tag) => (
            <span key={tag} className="text-[11px] text-[#D97706]">{tag}</span>
          ))}
        </div>

        <button type="button" onClick={() => onOpen(post)} className="mt-3 text-left">
          <h3 className="text-lg font-bold leading-snug text-white transition-colors hover:text-[#F0B429]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#B9A99B]">{post.content}</p>
        </button>

        <div className="mt-5 flex items-center justify-between border-t border-[#2A2421] pt-4 text-xs text-[#A69B93]">
          <div className="flex items-center gap-3">
            <button type="button" aria-label={`Upvote: ${post.title}`} onClick={() => onVote(post.id, "up")} className="flex items-center gap-1 hover:text-[#D97706]">
              <ThumbsUp className="h-4 w-4" /> {post.upvotes}
            </button>
            <button type="button" aria-label={`Downvote: ${post.title}`} onClick={() => onVote(post.id, "down")} className="flex items-center gap-1 hover:text-white">
              <ThumbsDown className="h-4 w-4" /> {post.downvotes}
            </button>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views}</span>
          </div>
          <button type="button" aria-label={`Chia sẻ bài viết: ${post.title}`} className="hover:text-white">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}