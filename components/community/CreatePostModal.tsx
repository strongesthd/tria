"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { CommunityCategory, CommunityPost } from "./types";

type CreatePostModalProps = { open: boolean; onClose: () => void; onCreate: (post: CommunityPost) => void };

const categories: { id: Exclude<CommunityCategory, "all">; label: string }[] = [
  { id: "home-barista", label: "Góc Home Barista" },
  { id: "machine-tech", label: "Bắt bệnh máy pha & kỹ thuật" },
  { id: "cafe-owner", label: "Thực chiến quản lý quán" },
  { id: "tria-lab", label: "TRIA Lab & Review hạt" },
  { id: "events", label: "Workshop & Sự kiện TP.HCM" },
];

export function CreatePostModal({ open, onClose, onCreate }: CreatePostModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const content = String(form.get("body") || "").trim();
    const category = String(form.get("category") || "home-barista") as Exclude<CommunityCategory, "all">;
    if (!title || !content) return;

    setPending(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          tags: form.get("urgent") ? ["#GiaiCuuBarista"] : [],
          image,
        }),
      });

      if (res.status === 401) throw new Error("Bạn cần đăng nhập để đăng bài.");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không thể đăng bài. Vui lòng thử lại.");
      }

      const created = await res.json();
      onCreate({
        id: created.id,
        title: created.title,
        content: created.content,
        category: created.category,
        categoryLabel: categories.find((c) => c.id === created.category)?.label || "Góc Home Barista",
        tags: created.tags ?? [],
        status: "Thảo luận",
        time: "Vừa xong",
        upvotes: created.upvotes ?? 0,
        downvotes: created.downvotes ?? 0,
        comments: 0,
        views: 0,
        points: 10,
        author: {
          id: created.author?.id ?? "",
          name: created.author?.name ?? "Thành viên mới",
          image: created.author?.image ?? null,
          role: created.author?.role ?? "MEMBER",
          badge: created.author?.badge ?? "Newbie Brewer",
        },
        commentsData: [],
      });
      event.currentTarget.reset();
      setImage(null);
      setImageName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Tạo thảo luận mới">
      <div className="mx-auto my-6 max-w-xl rounded-2xl border border-[#4A3B31] bg-[#171412] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">TRIA Community</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Tạo thảo luận mới</h2>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-full p-2 text-[#A69B93] hover:bg-[#2A2421] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="sr-only">Tiêu đề</span>
            <input name="title" required maxLength={180} placeholder="Tiêu đề: Bạn đang muốn chia sẻ điều gì?" className="w-full rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm text-white outline-none focus:border-[#D97706]" />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#4A3B31] bg-[#221D1A] p-3 text-xs text-[#CDBBAA] hover:border-[#D97706]">
            <ImagePlus className="h-4 w-4 text-[#D97706]" />
            <span>{imageName || "Đính kèm ảnh (tối đa 5MB)"}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) { setError("Ảnh không được vượt quá 5MB."); return; }
              const reader = new FileReader();
              reader.onload = () => { setImage(String(reader.result)); setImageName(file.name); setError(null); };
              reader.readAsDataURL(file);
            }} />
          </label>
          {image && <Image src={image} alt="Xem trước ảnh đính kèm" width={900} height={480} unoptimized className="max-h-48 w-full rounded-xl object-cover" />}
          <label className="block">
            <span className="sr-only">Danh mục</span>
            <select name="category" defaultValue="home-barista" className="w-full rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm text-white outline-none focus:border-[#D97706]">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Nội dung</span>
            <textarea name="body" required rows={6} maxLength={20000} placeholder="Mô tả thông số pha, tình trạng máy hoặc kinh nghiệm của bạn..." className="w-full resize-y rounded-xl border border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm text-white outline-none focus:border-[#D97706]" />
          </label>
          <label className="flex items-center gap-2 text-xs text-[#CDBBAA]">
            <input type="checkbox" name="urgent" className="accent-[#D97706]" /> #GiaiCuuBarista
          </label>

          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] py-3 text-sm font-bold text-[#1C1613] transition hover:bg-[#E08A1E] disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {pending ? "Đang đăng..." : "Đăng bài"}
          </button>
        </form>
      </div>
    </div>
  );
}
