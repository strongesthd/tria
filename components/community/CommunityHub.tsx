"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { COMMUNITY_POSTS } from "./mockData";
import { CreatePostModal } from "./CreatePostModal";
import { ForumFeed } from "./ForumFeed";
import { PostDetailModal } from "./PostDetailModal";
import { SidebarWidgets } from "./SidebarWidgets";
import { CommunityCategory, CommunityPost, PostAuthor, badgeFor } from "./types";

export default function CommunityHub() {
  // Start with the bundled sample content so the page is useful before login.
  // Render useful content immediately; refresh it from the API in the
  // background instead of making the first interaction wait for PostgreSQL.
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [category, setCategory] = useState<CommunityCategory>("all");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  // Load posts from the API, falling back to sample data on error.
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/community/posts?pageSize=20");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (Array.isArray(data?.items) && data.items.length) {
        setPosts(data.items.map(normalizePost));
      } else {
        setPosts(COMMUNITY_POSTS);
      }
    } catch {
      setPosts(COMMUNITY_POSTS);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchesCategory = category === "all" || post.category === category;
        const haystack = `${post.title} ${post.content} ${post.tags.join(" ")}`.toLowerCase();
        const query = deferredSearch.trim().toLowerCase();
        return matchesCategory && (!query || haystack.includes(query));
      }),
    [category, deferredSearch, posts]
  );

  const vote = (id: string, direction: "up" | "down") =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, upvotes: direction === "up" ? post.upvotes + 1 : post.upvotes, downvotes: direction === "down" ? post.downvotes + 1 : post.downvotes }
          : post
      )
    );

  const save = (id: string) =>
    setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const addComment = (postId: string, body: string) => {
    const comment = {
      id: `comment-${Date.now()}`,
      author: "Bạn",
      avatar: "",
      badge: badgeFor("Newbie Brewer"),
      body,
      time: "Vừa xong",
    };
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1, commentsData: [...post.commentsData, comment] } : post
      )
    );
    setSelectedPost((current) =>
      current ? { ...current, comments: current.comments + 1, commentsData: [...current.commentsData, comment] } : current
    );
  };

  const createPost = (post: CommunityPost) => {
    setPosts((current) => [post, ...current]);
    setCreateOpen(false);
  };

  return (
    <div className="rounded-3xl border border-[#2A2421] bg-[#0F0D0C] p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ForumFeed
          posts={filteredPosts}
          category={category}
          search={search}
          saved={saved}
          onCategory={(nextCategory) => startTransition(() => setCategory(nextCategory))}
          onSearch={(value) => startTransition(() => setSearch(value))}
          onOpen={setSelectedPost}
          onVote={vote}
          onSave={save}
          onCreate={() => setCreateOpen(true)}
        />
        <SidebarWidgets onOpenEvents={() => setCategory("events")} />
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onAddComment={addComment} />
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createPost} />
    </div>
  );
}

/** Raw post row as returned by GET /api/community/posts. */
type ApiPostRow = {
  id: string;
  title: string;
  content: string;
  category: CommunityPost["category"];
  tags: string[];
  solved: boolean;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  commentCount: number;
  image?: string | null;
  author: PostAuthor;
};

/** Maps an API post row into the UI shape. */
function normalizePost(row: ApiPostRow): CommunityPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    categoryLabel: categoryLabelFor(row.category),
    tags: row.tags ?? [],
    status: row.solved ? "Đã giải đáp" : "Thảo luận",
    time: relativeTimeFromIso(row.createdAt),
    upvotes: row.upvotes ?? 0,
    downvotes: row.downvotes ?? 0,
    comments: row.commentCount ?? 0,
    views: row.views ?? 0,
    points: (row.upvotes ?? 0) * 10,
    image: row.image ?? undefined,
    author: {
      id: row.author.id,
      name: row.author.name,
      image: row.author.image,
      role: row.author.role,
      badge: row.author.badge,
    },
    commentsData: [],
  };
}

function categoryLabelFor(category: string): string {
  const map: Record<string, string> = {
    "home-barista": "Góc Home Barista",
    "machine-tech": "Bắt bệnh máy pha",
    "cafe-owner": "Quản lý quán",
    "tria-lab": "TRIA Lab & Review",
    events: "Workshop TP.HCM",
  };
  return map[category] ?? "Thảo luận";
}

function relativeTimeFromIso(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
