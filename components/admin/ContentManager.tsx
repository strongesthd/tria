"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, ExternalLink, Eye, EyeOff, FileText, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCmsPage,
  createNewsArticle,
  deleteCmsPage,
  deleteNewsArticle,
  setCommunityPostPublished,
  setNewsArticlePublished,
  updateCmsPageContent,
  updateNewsArticle,
} from "../../app/actions/admin";
import ImageUploadButton from "./ImageUploadButton";
import RichContentEditor from "./RichContentEditor";

type ContentType = "pages" | "articles";
type CmsPage = {
  id: string; slug: string; title: string; published: boolean; updatedAt: string;
};
type CmsPageDetail = CmsPage & { summary: string; content: string; sortOrder: number };
type NewsArticle = {
  id: string; slug: string; title: string; published: boolean; publishedAt: string | null; updatedAt: string; source?: "cms";
};
type CommunityPost = { id: string; title: string; category: string; published: boolean; reviewedAt: string | null; createdAt: string; source: "community" };
type CommunityPostDetail = CommunityPost & { content: string; image: string | null; author: { name: string | null } };
type NewsArticleDetail = NewsArticle & {
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  content: string;
  image: string | null;
};
type ContentListItem = CmsPage | NewsArticle | CommunityPost;
type ContentItem = CmsPageDetail | NewsArticleDetail;

const buttonClass = "inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#3A302B] px-3 text-xs font-semibold text-[#CDBBAA] hover:border-[#D97706]";

function isCommunityPost(item: ContentListItem): item is CommunityPost {
  return "source" in item && item.source === "community";
}

export default function ContentManager() {
  const [type, setType] = useState<ContentType>("pages");
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [articles, setArticles] = useState<(NewsArticle | CommunityPost)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<ContentItem | "new" | null>(null);
  const [communityReview, setCommunityReview] = useState<CommunityPostDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [publishArticle, setPublishArticle] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/cms?type=${type}`, { cache: "no-store" });
      const payload = await response.json() as { items?: ContentListItem[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Không tải được nội dung.");
      if (type === "pages") setPages((payload.items || []) as CmsPage[]);
      else setArticles((payload.items || []) as (NewsArticle | CommunityPost)[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được nội dung.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      if (type === "pages") {
        const draft = {
          title: String(form.get("title") || ""),
          summary: String(form.get("summary") || ""),
          content: String(form.get("content") || ""),
        };
        if (editor === "new") await createCmsPage(draft);
        else if (editor) await updateCmsPageContent(editor.id, draft);
      } else {
        const draft = {
          title: String(form.get("title") || ""),
          slug: String(form.get("slug") || ""),
          content: String(form.get("content") || ""),
          published: form.get("published") === "on",
          excerpt: String(form.get("excerpt") || ""),
          seoTitle: String(form.get("seoTitle") || ""),
          metaDescription: String(form.get("metaDescription") || ""),
          focusKeyword: String(form.get("focusKeyword") || ""),
          secondaryKeywords: String(form.get("secondaryKeywords") || ""),
          image: String(form.get("image") || "") || null,
        };
        if (editor === "new") await createNewsArticle(draft);
        else if (editor) await updateNewsArticle(editor.id, draft);
      }
      setEditor(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu nội dung.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ContentListItem) {
    if (isCommunityPost(item)) return;
    if (!window.confirm(`Xóa "${item.title}"?`)) return;
    setError("");
    try {
      if (type === "pages") await deleteCmsPage(item.id);
      else await deleteNewsArticle(item.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa nội dung.");
    }
  }

  async function edit(item: ContentListItem) {
    setError("");
    try {
      const response = await fetch(`/api/admin/cms?type=${type}&id=${encodeURIComponent(item.id)}`, { cache: "no-store" });
      const payload = await response.json() as { item?: ContentItem; error?: string };
      if (!response.ok || !payload.item) throw new Error(payload.error || "Không tải được nội dung.");
      setPublishArticle(type === "articles" && payload.item.published);
      setEditor(payload.item);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được nội dung.");
    }
  }

  async function reviewCommunityPost(item: CommunityPost) {
    setError("");
    try {
      const response = await fetch(`/api/admin/cms?type=community&id=${encodeURIComponent(item.id)}`, { cache: "no-store" });
      const payload = await response.json() as { item?: CommunityPostDetail; error?: string };
      if (!response.ok || !payload.item) throw new Error(payload.error || "Không tải được bài cộng đồng.");
      setCommunityReview(payload.item);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được bài cộng đồng.");
    }
  }

  async function toggleCommunityPost(item: CommunityPost) {
    setBusy(true);
    setError("");
    try {
      await setCommunityPostPublished(item.id, !item.published);
      setCommunityReview(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái bài viết.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleNewsArticle(item: NewsArticle) {
    setBusy(true);
    setError("");
    try {
      await setNewsArticlePublished(item.id, !item.published);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái bài viết.");
    } finally {
      setBusy(false);
    }
  }

  const items: ContentListItem[] = type === "pages" ? pages : articles;
  const pageEditor = type === "pages" && editor && editor !== "new" ? editor as CmsPageDetail : null;
  const articleEditor = type === "articles" && editor && editor !== "new" ? editor as NewsArticleDetail : null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#3A302B] bg-[#171412]">
      <header className="flex flex-col justify-between gap-4 border-b border-[#2A2421] p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Trang nội dung &amp; bài viết</h2>
          <p className="mt-1 text-xs text-[#81746B]">Soạn trang riêng cho website và quản lý bài viết hiện có.</p>
        </div>
        <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#D97706] px-4 text-sm font-bold text-[#1C1613]" onClick={() => { setError(""); setPublishArticle(false); setEditor("new"); }}>
          <Plus className="h-4 w-4" aria-hidden /> {type === "pages" ? "Tạo trang" : "Tạo bài viết"}
        </button>
      </header>

      <nav className="flex gap-2 border-b border-[#2A2421] p-4" aria-label="Loại nội dung">
        <button type="button" aria-pressed={type === "pages"} onClick={() => setType("pages")} className={`${buttonClass} ${type === "pages" ? "border-[#D97706] bg-[#D97706] text-[#1C1613]" : ""}`}>
          <FileText className="h-4 w-4" aria-hidden /> Trang nội dung
        </button>
        <button type="button" aria-pressed={type === "articles"} onClick={() => setType("articles")} className={`${buttonClass} ${type === "articles" ? "border-[#D97706] bg-[#D97706] text-[#1C1613]" : ""}`}>
          <Newspaper className="h-4 w-4" aria-hidden /> Tin tức / bài viết
        </button>
      </nav>

      {error && !editor && <p role="alert" className="m-4 rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
      {loading ? <p className="p-8 text-center text-sm text-[#81746B]">Đang tải...</p> : items.length ? (
        <ul className="divide-y divide-[#2A2421]">
          {items.map((item) => {
            const isPage = type === "pages";
            const page = isPage ? item as CmsPage : null;
            const communityPost = isCommunityPost(item);
            const published = item.published;
            const itemHref = communityPost ? `/cong-dong/${item.id}` : `/${isPage ? "noi-dung" : "tin-tuc"}/${item.slug}`;
            return (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-white">{item.title}</strong>
                  {(!isPage || published) && <span className="mt-1 block break-all text-xs text-[#81746B]">{itemHref}</span>}
                  <span className="mt-2 inline-flex rounded-full bg-[#2A2421] px-2 py-1 text-[11px] text-[#CDBBAA]">
                    {communityPost ? `Bài cộng đồng · ${published ? "Đã xuất bản" : item.reviewedAt ? "Đang ẩn" : "Chờ duyệt"} · ${item.category}` : published ? "Đã xuất bản" : "Bản nháp"}
                    {page && " · Cấu hình hiển thị trong tab Footer"}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  {communityPost ? (
                    <button type="button" className={buttonClass} aria-label={`Xem xét ${item.title}`} onClick={() => void reviewCommunityPost(item)}><Eye className="h-4 w-4" aria-hidden /> Xem xét</button>
                  ) : <button type="button" className={buttonClass} aria-label={`Sửa ${item.title}`} onClick={() => void edit(item)}><Pencil className="h-4 w-4" aria-hidden /> Sửa</button>}
                  <a className={`${buttonClass} ${published ? "" : "pointer-events-none opacity-40"}`} href={itemHref} target="_blank" rel="noreferrer" aria-label={`Mở ${item.title}`}><ExternalLink className="h-4 w-4" aria-hidden /> Xem</a>
                  {!communityPost && !isPage && <button type="button" disabled={busy} className={`${buttonClass} disabled:opacity-50`} aria-label={published ? `Ẩn ${item.title}` : `Xuất bản ${item.title}`} onClick={() => void toggleNewsArticle(item as NewsArticle)}>{published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}{published ? "Ẩn" : "Đăng"}</button>}
                  {!communityPost && <button type="button" className={`${buttonClass} text-red-400`} aria-label={`Xóa ${item.title}`} onClick={() => void remove(item)}><Trash2 className="h-4 w-4" aria-hidden /> Xóa</button>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className="p-8 text-center text-sm text-[#81746B]">Chưa có {type === "pages" ? "trang nội dung" : "bài viết"} nào.</p>}

      {editor && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={type === "pages" ? "Biên tập trang" : "Biên tập bài viết"} onClick={() => !busy && setEditor(null)}>
          <form key={editor === "new" ? `new-${type}` : editor.id} onSubmit={(event) => void save(event)} onClick={(event) => event.stopPropagation()} className="mx-auto my-6 grid max-w-3xl gap-4 rounded-2xl border border-[#4A3B31] bg-[#171412] p-6 text-sm text-[#CDBBAA]">
            <div>
              <h3 className="text-xl font-bold text-white">{editor === "new" ? (type === "pages" ? "Tạo trang nội dung" : "Tạo bài viết") : (type === "pages" ? "Chỉnh sửa trang nội dung" : "Chỉnh sửa bài viết")}</h3>
              <p className="mt-1 text-xs text-[#81746B]">{type === "pages" ? "Tạo trang riêng cho website. Slug và tùy chọn hiển thị trong Footer được quản lý tại tab Footer." : "Soạn thảo định dạng, chèn HTML, ảnh và tệp đính kèm."}</p>
            </div>
            <label className="grid gap-1">Tiêu đề<input name="title" required minLength={2} maxLength={180} defaultValue={pageEditor?.title || articleEditor?.title} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
            {type === "articles" && <label className="grid gap-1">Slug / đường dẫn<input name="slug" required maxLength={140} pattern="[A-Za-z0-9À-ỹĐđ_-]+" defaultValue={articleEditor?.slug} placeholder="vi-du-bai-viet" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /><span className="text-[11px] text-[#81746B]">Chỉ dùng chữ, số, dấu gạch ngang hoặc gạch dưới.</span></label>}
            {type === "pages" ? (
              <label className="grid gap-1">Mô tả ngắn<textarea name="summary" maxLength={300} rows={2} defaultValue={pageEditor?.summary} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
            ) : (
              <>
                <label className="grid gap-1">Mô tả ngắn<textarea name="excerpt" maxLength={300} rows={2} defaultValue={articleEditor?.excerpt} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
                <fieldset className="grid gap-3 rounded-lg border border-[#3A302B] p-4">
                  <legend className="px-1 font-semibold text-white">Thông tin SEO</legend>
                  <label className="grid gap-1">Tiêu đề SEO (SEO Title)<input name="seoTitle" required={publishArticle} maxLength={180} defaultValue={articleEditor?.seoTitle} placeholder="Tiêu đề hiển thị trên Google" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /><span className="text-[11px] text-[#81746B]">Nên viết ngắn gọn, mô tả đúng nội dung bài viết.</span></label>
                  <label className="grid gap-1">Thẻ Description<textarea name="metaDescription" required={publishArticle} maxLength={300} rows={3} defaultValue={articleEditor?.metaDescription} placeholder="Mô tả nội dung bài viết trên kết quả tìm kiếm" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /><span className="text-[11px] text-[#81746B]">Khuyến nghị khoảng 120–160 ký tự; nội dung nên rõ ràng và phù hợp với bài viết.</span></label>
                  <label className="grid gap-1">Từ khóa chính<input name="focusKeyword" required={publishArticle} maxLength={100} defaultValue={articleEditor?.focusKeyword} placeholder="Ví dụ: cà phê Arabica" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
                  <label className="grid gap-1">Từ khóa phụ<input name="secondaryKeywords" required={publishArticle} maxLength={300} defaultValue={articleEditor?.secondaryKeywords} placeholder="Phân cách bằng dấu phẩy" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
                </fieldset>
                <ContentImageField key={articleEditor?.id || "new"} value={articleEditor?.image || ""} />
              </>
            )}

            <RichContentEditor key={editor === "new" ? `editor-new-${type}` : `editor-${editor.id}`} name="content" initialContent={pageEditor?.content || articleEditor?.content} />
            {type === "articles" && <label className="flex items-center gap-2"><input name="published" type="checkbox" checked={publishArticle} onChange={(event) => setPublishArticle(event.currentTarget.checked)} className="accent-[#D97706]" /> Xuất bản công khai</label>}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setEditor(null)} className={buttonClass}>Hủy</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-[#D97706] px-4 py-2 font-bold text-[#1C1613] disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </form>
        </div>
      )}
      {communityReview && (
        <div className="fixed inset-0 z-[95] overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={`Xem xét bài cộng đồng: ${communityReview.title}`} onClick={() => !busy && setCommunityReview(null)}>
          <section onClick={(event) => event.stopPropagation()} className="mx-auto my-8 grid max-w-3xl gap-4 rounded-2xl border border-[#4A3B31] bg-[#171412] p-6 text-sm text-[#CDBBAA]">
            <div>
              <h3 className="text-xl font-bold text-white">{communityReview.title}</h3>
              <p className="mt-1 text-xs text-[#81746B]">Tác giả: {communityReview.author.name || "Thành viên TRIA"} · {communityReview.category}</p>
            </div>
            {communityReview.image && <Image src={communityReview.image} alt="" width={1200} height={800} unoptimized className="max-h-80 w-full rounded-lg object-contain" />}
            <div className="max-h-[45vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#3A302B] bg-[#221D1A] p-4 text-[#E8E2D9]">{communityReview.content}</div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full px-2 py-1 text-xs ${communityReview.published ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-300"}`}>
              {communityReview.published ? "Đã xuất bản" : communityReview.reviewedAt ? "Đang ẩn" : "Chờ duyệt"}
              </span>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => setCommunityReview(null)} className={buttonClass}>Đóng</button>
                <button type="button" disabled={busy} onClick={() => void toggleCommunityPost(communityReview)} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold disabled:opacity-50 ${communityReview.published ? "border border-[#3A302B] text-[#CDBBAA]" : "bg-[#D97706] text-[#1C1613]"}`}>
                  {communityReview.published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                  {communityReview.published ? "Ẩn bài" : "Duyệt & xuất bản"}
                </button>
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          </section>
        </div>
      )}
    </section>
  );
}

function ContentImageField({ value }: { value: string }) {
  const [image, setImage] = useState(value);
  const uploaded = image.startsWith("data:");
  return <div className="grid gap-1">Ảnh bìa URL hoặc upload<textarea value={uploaded ? "" : image} onChange={(event) => setImage(event.target.value)} rows={2} placeholder={uploaded ? "Đã chọn ảnh từ thiết bị" : "Dán URL ảnh hoặc chọn file"} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /><input type="hidden" name="image" value={image} /><ImageUploadButton label="Chọn ảnh bìa (tối đa 5MB)" onSelect={(images) => setImage(images[0] || "")} />{uploaded && <button type="button" onClick={() => setImage("")} className="text-left text-[11px] text-[#E2A168] hover:underline">Xóa ảnh đã chọn</button>}</div>;
}
