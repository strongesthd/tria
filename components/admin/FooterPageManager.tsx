"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { updateCmsPageFooterSettings } from "../../app/actions/admin";

type FooterSection = "POLICY" | "SUPPORT" | null;
type CmsPage = {
  id: string;
  slug: string;
  title: string;
  footerSection: FooterSection;
  sortOrder: number;
  published: boolean;
};

const buttonClass = "inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#3A302B] px-3 text-xs font-semibold text-[#CDBBAA] hover:border-[#D97706]";

export default function FooterPageManager() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<CmsPage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/cms?type=pages", { cache: "no-store" });
      const payload = await response.json() as { items?: CmsPage[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Không tải được danh sách trang.");
      setPages(payload.items || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được danh sách trang.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await updateCmsPageFooterSettings(editor.id, {
        slug: String(form.get("slug") || ""),
        footerSection: (String(form.get("footerSection") || "") || null) as FooterSection,
        sortOrder: Number(form.get("sortOrder") || 0),
        published: form.get("published") === "on",
      });
      setEditor(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật cấu hình trang.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#3A302B] bg-[#171412]">
      <header className="border-b border-[#2A2421] p-5">
        <h2 className="text-xl font-bold text-white">Trang nội dung trong Footer</h2>
        <p className="mt-1 text-xs text-[#81746B]">Quản lý slug, nhóm Footer, thứ tự và trạng thái hiển thị. Nội dung trang được sửa trong tab Nội dung.</p>
      </header>
      {error && !editor && <p role="alert" className="m-4 rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
      {loading ? <p className="p-8 text-center text-sm text-[#81746B]">Đang tải...</p> : pages.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#221D1A] text-xs uppercase text-[#A69B93]">
              <tr>
                <th className="px-5 py-3">Trang</th>
                <th className="px-5 py-3">Nhóm Footer</th>
                <th className="px-5 py-3">Thứ tự</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t border-[#2A2421] text-[#CDBBAA]">
                  <td className="max-w-[360px] px-5 py-4">
                    <strong className="block truncate text-white">{page.title}</strong>
                    <span className="mt-1 block break-all text-xs text-[#81746B]">/noi-dung/{page.slug}</span>
                  </td>
                  <td className="px-5 py-4 text-xs">{page.footerSection === "POLICY" ? "Chính sách" : page.footerSection === "SUPPORT" ? "Tư vấn & hỗ trợ" : "Không hiển thị trong Footer"}</td>
                  <td className="px-5 py-4 tabular-nums">{page.sortOrder}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-sm px-2 py-1 text-xs ${page.published ? "bg-emerald-500/10 text-emerald-400" : "bg-[#3A3021] text-[#A69B93]"}`}>
                      {page.published ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button type="button" className={buttonClass} aria-label={`Cấu hình ${page.title}`} onClick={() => { setError(""); setEditor(page); }}>
                        <Pencil className="h-4 w-4" aria-hidden /> Cấu hình
                      </button>
                      <a className={`${buttonClass} ${page.published ? "" : "pointer-events-none opacity-40"}`} href={`/noi-dung/${page.slug}`} target="_blank" rel="noreferrer" aria-label={`Mở ${page.title}`}>
                        <ExternalLink className="h-4 w-4" aria-hidden /> Xem
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="p-8 text-center text-sm text-[#81746B]">Chưa có trang nội dung. Hãy tạo trang trong tab Nội dung.</p>}

      {editor && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={`Cấu hình Footer: ${editor.title}`} onClick={() => !busy && setEditor(null)}>
          <form key={editor.id} onSubmit={(event) => void save(event)} onClick={(event) => event.stopPropagation()} className="mx-auto my-12 grid max-w-xl gap-4 rounded-2xl border border-[#4A3B31] bg-[#171412] p-6 text-sm text-[#CDBBAA]">
            <div>
              <h3 className="text-xl font-bold text-white">Cấu hình trang Footer</h3>
              <p className="mt-1 text-xs text-[#81746B]">{editor.title}</p>
            </div>
            <label className="grid gap-1">Slug / đường dẫn
              <span className="flex items-center rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 text-[#81746B]">/noi-dung/
                <input name="slug" required maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editor.slug} className="min-w-0 flex-1 bg-transparent py-2 text-white outline-none" />
              </span>
              <span className="text-[11px] text-[#81746B]">Chỉ dùng chữ, số và dấu gạch ngang.</span>
            </label>
            <label className="grid gap-1">Nhóm Footer
              <select name="footerSection" defaultValue={editor.footerSection || ""} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white">
                <option value="">Không hiển thị trong Footer</option>
                <option value="POLICY">Chính sách</option>
                <option value="SUPPORT">Tư vấn &amp; hỗ trợ</option>
              </select>
            </label>
            <label className="grid gap-1">Thứ tự hiển thị
              <input name="sortOrder" type="number" min={0} max={9999} step={1} defaultValue={editor.sortOrder} className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-white" />
            </label>
            <label className="flex items-center gap-2"><input name="published" type="checkbox" defaultChecked={editor.published} className="accent-[#D97706]" /> Hiển thị công khai</label>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setEditor(null)} className={buttonClass}>Hủy</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-[#D97706] px-4 py-2 font-bold text-[#1C1613] disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu cấu hình"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
