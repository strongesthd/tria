"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createFooterLink,
  deleteFooterLink,
  setFooterLinkActive,
  updateFooterLink,
} from "../../app/actions/admin";

type Section = "POLICY" | "SUPPORT";
type FooterLink = {
  id: string;
  section: Section;
  label: string;
  href: string;
  sortOrder: number;
  active: boolean;
};
type FooterLinkDraft = Omit<FooterLink, "id" | "active">;
type ListResponse = {
  items: FooterLink[];
  page: number;
  total: number;
  totalPages: number;
};

const SECTIONS: { id: Section | "all"; label: string }[] = [
  { id: "all", label: "Tất cả nhóm" },
  { id: "POLICY", label: "Chính sách" },
  { id: "SUPPORT", label: "Tư vấn & hỗ trợ" },
];

export default function FooterLinkManager() {
  const [items, setItems] = useState<FooterLink[]>([]);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section | "all">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<FooterLink | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), q: query });
    if (section !== "all") params.set("section", section);
    try {
      const response = await fetch(`/api/admin/footer-links?${params}`, { cache: "no-store" });
      const payload = (await response.json()) as ListResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Không tải được liên kết footer.");
      setItems(payload.items);
      setPage(payload.page);
      setTotal(payload.total);
      setTotalPages(payload.totalPages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được liên kết footer.");
    } finally {
      setLoading(false);
    }
  }, [page, query, section]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: FooterLinkDraft = {
      label: String(form.get("label") || ""),
      href: String(form.get("href") || ""),
      section: String(form.get("section") || "SUPPORT") as Section,
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    setBusyId("save");
    setError("");
    try {
      if (editor === "new") await createFooterLink(draft);
      else if (editor) await updateFooterLink(editor.id, draft);
      setEditor(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu liên kết.");
    } finally {
      setBusyId("");
    }
  }

  async function toggle(link: FooterLink) {
    setBusyId(link.id);
    setError("");
    try {
      await setFooterLinkActive(link.id, !link.active);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(link: FooterLink) {
    if (!window.confirm(`Xóa liên kết “${link.label}”?`)) return;
    setBusyId(link.id);
    setError("");
    try {
      await deleteFooterLink(link.id);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa liên kết.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#3A302B] bg-[#171412]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#2A2421] p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Liên kết Footer tùy chỉnh</h2>
          <p className="mt-1 text-xs text-[#81746B]">{total} liên kết độc lập; nội dung trang được quản lý ở bảng phía trên.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditor("new");
          }}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#D97706] px-4 text-sm font-bold text-[#1C1613] hover:bg-[#E98B1A]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Thêm liên kết
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#2A2421] p-4 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Tìm liên kết</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#81746B]" aria-hidden />
          <input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Tìm theo tên hoặc đường dẫn..."
            className="h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] pl-10 pr-3 text-sm text-white outline-none focus:border-[#D97706]"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo nhóm</span>
          <select
            value={section}
            onChange={(event) => {
              setPage(1);
              setSection(event.target.value as Section | "all");
            }}
            className="h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] px-3 text-sm text-white sm:w-52"
          >
            {SECTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && !editor && <p role="alert" className="m-4 rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#221D1A] text-xs uppercase text-[#A69B93]">
            <tr>
              <th className="px-5 py-3">Liên kết</th>
              <th className="px-5 py-3">Nhóm</th>
              <th className="px-5 py-3">Thứ tự</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((link) => (
              <tr key={link.id} className="border-t border-[#2A2421] text-[#CDBBAA]">
                <td className="max-w-[340px] px-5 py-4">
                  <strong className="block break-words text-white">{link.label}</strong>
                  <span className="mt-1 block break-all text-xs text-[#81746B]">{link.href}</span>
                </td>
                <td className="px-5 py-4 text-xs">{link.section === "POLICY" ? "Chính sách" : "Tư vấn & hỗ trợ"}</td>
                <td className="px-5 py-4 tabular-nums">{link.sortOrder}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-sm px-2 py-1 text-xs ${link.active ? "bg-emerald-500/10 text-emerald-400" : "bg-[#3A302B] text-[#A69B93]"}`}>
                    {link.active ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Sửa ${link.label}`}
                      title="Sửa liên kết"
                      onClick={() => {
                        setError("");
                        setEditor(link);
                      }}
                      className="rounded-md border border-[#3A302B] p-2 hover:border-[#D97706]"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={link.active ? `Ẩn ${link.label}` : `Hiện ${link.label}`}
                      title={link.active ? "Ẩn liên kết" : "Hiện liên kết"}
                      disabled={busyId === link.id}
                      onClick={() => void toggle(link)}
                      className="rounded-md border border-[#3A302B] p-2 hover:border-[#D97706] disabled:opacity-50"
                    >
                      {link.active ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa ${link.label}`}
                      title="Xóa liên kết"
                      disabled={busyId === link.id}
                      onClick={() => void remove(link)}
                      className="rounded-md border border-red-900/50 p-2 text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !items.length && (
        <p className="p-8 text-center text-sm text-[#81746B]">
          {query || section !== "all" ? "Không tìm thấy liên kết phù hợp." : "Chưa có liên kết footer."}
        </p>
      )}
      {loading && <p className="p-4 text-center text-xs text-[#81746B]">Đang tải...</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2A2421] p-4 text-xs text-[#A69B93]">
        <span>{total ? `Trang ${page}/${totalPages} · ${total} liên kết` : "0 liên kết"}</span>
        <div className="flex gap-2">
          <button type="button" aria-label="Trang đầu" title="Trang đầu" disabled={page <= 1 || loading} onClick={() => setPage(1)} className="rounded-md border border-[#3A302B] p-2 disabled:opacity-30">
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Trang trước" title="Trang trước" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-[#3A302B] p-2 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Trang sau" title="Trang sau" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-[#3A302B] p-2 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Trang cuối" title="Trang cuối" disabled={page >= totalPages || loading} onClick={() => setPage(totalPages)} className="rounded-md border border-[#3A302B] p-2 disabled:opacity-30">
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {editor && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && busyId !== "save") setEditor(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="footer-link-title" className="mx-auto my-8 max-w-xl rounded-lg border border-[#4A3B31] bg-[#171412] p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 id="footer-link-title" className="text-lg font-bold text-white">{editor === "new" ? "Thêm liên kết footer" : "Sửa liên kết footer"}</h3>
              <button type="button" aria-label="Đóng" disabled={busyId === "save"} onClick={() => setEditor(null)} className="rounded-md p-1 text-[#A69B93] hover:text-white disabled:opacity-50">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <form onSubmit={(event) => void save(event)} className="mt-5 grid gap-4">
              {error && <p role="alert" className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
              <label className="text-xs font-semibold text-[#CDBBAA]">
                Tên hiển thị
                <input name="label" required minLength={2} maxLength={80} defaultValue={editor === "new" ? "" : editor.label} className="mt-1 h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] px-3 text-sm text-white outline-none focus:border-[#D97706]" />
              </label>
              <label className="text-xs font-semibold text-[#CDBBAA]">
                Đường dẫn nội bộ
                <input name="href" required maxLength={300} defaultValue={editor === "new" ? "" : editor.href} placeholder="/phap-ly/bao-mat" className="mt-1 h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] px-3 text-sm text-white outline-none focus:border-[#D97706]" />
                <span className="mt-1 block font-normal text-[#81746B]">Bắt đầu bằng / và trỏ tới trang TRIA.</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#CDBBAA]">
                  Nhóm
                  <select name="section" defaultValue={editor === "new" ? "SUPPORT" : editor.section} className="mt-1 h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] px-3 text-sm text-white">
                    <option value="POLICY">Chính sách</option>
                    <option value="SUPPORT">Tư vấn & hỗ trợ</option>
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#CDBBAA]">
                  Thứ tự hiển thị
                  <input name="sortOrder" type="number" min={0} max={9999} step={1} defaultValue={editor === "new" ? 0 : editor.sortOrder} className="mt-1 h-10 w-full rounded-md border border-[#3A302B] bg-[#221D1A] px-3 text-sm text-white" />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" disabled={busyId === "save"} onClick={() => setEditor(null)} className="min-h-10 rounded-md border border-[#3A302B] px-4 text-sm text-[#CDBBAA] disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={busyId === "save"} className="min-h-10 rounded-md bg-[#D97706] px-4 text-sm font-bold text-[#1C1613] disabled:opacity-50">
                  {busyId === "save" ? "Đang lưu..." : "Lưu liên kết"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
