export type CommunityCategory =
  | "all"
  | "home-barista"
  | "machine-tech"
  | "cafe-owner"
  | "tria-lab"
  | "events";

export const CATEGORY_LABELS: Record<Exclude<CommunityCategory, "all">, string> = {
  "home-barista": "Góc Home Barista",
  "machine-tech": "Bắt bệnh máy pha",
  "cafe-owner": "Quản lý quán",
  "tria-lab": "TRIA Lab & Review",
  events: "Workshop TP.HCM",
};

export type Badge = {
  icon: string;
  label: string;
  tone: string;
};

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  badge: Badge;
  body: string;
  image?: string | null;
  time: string;
  accepted?: boolean;
  parentId?: string | null;
};

/** Public author shape returned by the API (never includes email or passwordHash). */
export type PostAuthor = {
  id: string;
  name: string | null;
  image: string | null;
  role: "MEMBER" | "CAFE_OWNER" | "TRIA_BARISTA" | "TRIA_TECH" | "ADMIN";
  badge: string;
};

export type CommunityPost = {
  id: string;
  title: string;
  content: string;
  category: Exclude<CommunityCategory, "all">;
  categoryLabel: string;
  tags: string[];
  status: string;
  time: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  views: number;
  points: number;
  image?: string | null;
  author: PostAuthor;
  commentsData: Comment[];
};

export type PostsPage = {
  items: CommunityPost[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const BADGES: Record<string, Badge> = {
  newbie: { icon: "🥉", label: "Newbie Brewer", tone: "text-[#D7A56D]" },
  home: { icon: "🥈", label: "Home Barista", tone: "text-slate-300" },
  master: { icon: "🥇", label: "TRIA Master Barista", tone: "text-[#F0B429]" },
  tech: { icon: "🛠️", label: "TRIA Tech Specialist", tone: "text-[#D97706]" },
  owner: { icon: "💼", label: "Cafe Owner", tone: "text-[#C58D45]" },
};

/** Maps a persisted badge string to its icon/tone presentation. */
export function badgeFor(badgeLabel: string): Badge {
  const found = Object.values(BADGES).find((b) => b.label === badgeLabel);
  return found ?? { icon: "🥉", label: badgeLabel, tone: "text-[#D7A56D]" };
}

export function relativeTime(date: string | Date): string {
  const then = new Date(date).getTime();
  const diffMinutes = Math.floor((Date.now() - then) / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}
