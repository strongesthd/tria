"use client";

import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { PostCard } from "./PostCard";
import { CommunityCategory, CommunityPost } from "./types";

const categories: { id: CommunityCategory; label: string }[] = [
  { id: "all", label: "Tất cả bài viết" },
  { id: "home-barista", label: "Góc Home Barista" },
  { id: "machine-tech", label: "Bắt bệnh máy pha" },
  { id: "cafe-owner", label: "Quản lý quán" },
  { id: "tria-lab", label: "TRIA Lab & Review" },
  { id: "events", label: "Workshop TP.HCM" },
];

type ForumFeedProps = {
  posts: CommunityPost[];
  category: CommunityCategory;
  search: string;
  saved: string[];
  onCategory: (category: CommunityCategory) => void;
  onSearch: (search: string) => void;
  onOpen: (post: CommunityPost) => void;
  onVote: (id: string, direction: "up" | "down") => void;
  onSave: (id: string) => void;
  onCreate: () => void;
};

export function ForumFeed({ posts, category, search, saved, onCategory, onSearch, onOpen, onVote, onSave, onCreate }: ForumFeedProps) {
  return (
    <section className="min-w-0">
      <div className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">Community Feed</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Thảo luận mới nhất</h2>
          </div>
          <button type="button" onClick={onCreate} className="flex items-center justify-center gap-2 rounded-xl bg-[#D97706] px-4 py-3 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E]">
            <Plus className="h-4 w-4" aria-hidden /> Tạo thảo luận mới
          </button>
        </div>
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69B93]" aria-hidden />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tìm bài viết, chủ đề, lỗi kỹ thuật..."
            aria-label="Tìm kiếm bài viết"
            className="w-full rounded-xl border border-[#3A302B] bg-[#221D1A] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D97706]"
          />
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
        role="tablist"
        aria-label="Lọc chủ đề cộng đồng"
      >
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategory(item.id)}
            aria-pressed={category === item.id}
            className={`min-h-10 rounded-xl border px-2.5 py-2 text-center text-xs font-semibold leading-tight transition-colors ${
              category === item.id ? "border-[#D97706] bg-[#D97706] text-[#1C1613]" : "border-[#3A302B] text-[#B9A99B] hover:border-[#D97706] hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-[#81746B]">
        <span>{posts.length} bài viết trong cộng đồng</span>
        <span className="flex items-center gap-1"><SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Mới nhất</span>
      </div>

      <div className="mt-3 space-y-4">
        {posts.length ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={onOpen} onVote={onVote} saved={saved.includes(post.id)} onSave={onSave} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#4A3B31] p-10 text-center text-sm text-[#A69B93]">
            <Filter className="mx-auto mb-3 h-6 w-6 text-[#D97706]" aria-hidden />
            Không tìm thấy thảo luận phù hợp.
          </div>
        )}
      </div>
    </section>
  );
}
