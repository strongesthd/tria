"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ExternalLink, FileText, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCmsPage,
  createNewsArticle,
  deleteCmsPage,
  deleteNewsArticle,
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
  id: string; slug: string; title: string; published: boolean; publishedAt: string | null; updatedAt: string;
};
type NewsArticleDetail = NewsArticle & { excerpt: string; content: string; image: string | null };
type ContentListItem = CmsPage | NewsArticle;
type ContentItem = CmsPageDetail | NewsArticleDetail;

const buttonClass = "inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#3A302B] px-3 text-xs font-semibold text-[#CDBBAA] hover:border-[#D97706]";

export default function ContentManager() {
  const [type, setType] = useState<ContentType>("pages");
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<ContentItem | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/cms?type=${type}`, { cache: "no-store" });
      const payload = await response.json() as { items?: ContentItem[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Không tải được nội dung.");
      if (type === "pages") setPages((payload.items || []) as CmsPage[]);
      else setArticles((payload.items || []) as NewsArticle[]);
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
      setEditor(payload.item);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được nội dung.");
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
          <p className="mt-1 text-xs text-[#81746B]">Soạn nội dung trang, tin tức và bài viết trên website.</p>
        </div>
        <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#D97706] px-4 text-sm font-bold text-[#1C1613]" onClick={() => { setError(""); setEditor("new"); }}>
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
            return (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-white">{item.title}</strong>
                  {(!isPage || item.published) && <span className="mt-1 block break-all text-xs text-[#81746B]">/{isPage ? "noi-dung" : "tin-tuc"}/{item.slug}</span>}
                  <span className="mt-2 inline-flex rounded-full bg-[#2A2421] px-2 py-1 text-[11px] text-[#CDBBAA]">
                    {item.published ? "Đã xuất bản" : "Bản nháp"}
                    {page && " · Cấu hình hiển thị trong tab Footer"}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className={buttonClass} aria-label={`Sửa ${item.title}`} onClick={() => void edit(item)}><Pencil className="h-4 w-4" aria-hidden /> Sửa</button>
                  <a className={`${buttonClass} ${item.published ? "" : "pointer-events-none opacity-40"}`} href={`/${isPage ? "noi-dung" : "tin-tuc"}/${item.slug}`} target="_blank" rel="noreferrer" aria-label={`Mở ${item.title}`}><ExternalLink className="h-4 w-4" aria-hidden /> Xem</a>
                  <button type="button" className={`${buttonClass} text-red-400`} aria-label={`Xóa ${item.title}`} onClick={() => void remove(item)}><Trash2 className="h-4 w-4" aria-hidden /> Xóa</button>
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
              <h3 className="text-xl font-bold text-white">{editor === "new" ? "Tạo mới" : "Chỉnh sửa"} {type === "pages" ? "trang Footer" : "bài viết"}</h3>
              <p className="mt-1 text-xs text-[#81746B]">{type === "pages" ? "Chỉ chỉnh sửa nội dung tại đây. Slug và hiển thị Footer được quản lý trong tab Footer." : "Soạn thảo định dạng, chèn HTML, ảnh và tệp đính kèm."}</p>
            </div>
            <label className="grid gap-1">Tiêu đề<input name="title" required minLength={2} maxLength={180} defaultValue={pageEditor?.title || articleEditor?.title} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
            {type === "articles" && <label className="grid gap-1">Slug / đường dẫn<input name="slug" required maxLength={140} pattern="[A-Za-z0-9À-ỹĐđ_-]+" defaultValue={articleEditor?.slug} placeholder="vi-du-bai-viet" className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /><span className="text-[11px] text-[#81746B]">Chỉ dùng chữ, số, dấu gạch ngang hoặc gạch dưới.</span></label>}
            {type === "pages" ? (
              <label className="grid gap-1">Mô tả ngắn<textarea name="summary" maxLength={300} rows={2} defaultValue={pageEditor?.summary} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
            ) : (
              <>
                <label className="grid gap-1">Mô tả ngắn<textarea name="excerpt" maxLength={300} rows={2} defaultValue={articleEditor?.excerpt} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" /></label>
                <ContentImageField key={articleEditor?.id || "new"} value={articleEditor?.image || ""} />
              </>
            )}
            <RichContentEditor key={editor === "new" ? `editor-new-${type}` : `editor-${editor.id}`} name="content" initialContent={pageEditor?.content || articleEditor?.content} />
            {type === "articles" && <label className="flex items-center gap-2"><input name="published" type="checkbox" defaultChecked={articleEditor?.published} className="accent-[#D97706]" /> Xuất bản công khai</label>}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setEditor(null)} className={buttonClass}>Hủy</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-[#D97706] px-4 py-2 font-bold text-[#1C1613] disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </form>
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
