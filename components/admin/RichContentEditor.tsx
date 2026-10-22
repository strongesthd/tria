"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  Bold,
  Code2,
  FilePlus2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  RotateCw,
  Underline,
} from "lucide-react";

type RichContentEditorProps = {
  name: string;
  initialContent?: string;
};

const editorClass = "min-h-72 w-full overflow-y-auto rounded-b-lg border border-t-0 border-[#3A302B] bg-[#221D1A] px-4 py-3 text-sm leading-7 text-white outline-none focus:border-[#D97706]";
const toolbarButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#3A302B] text-[#CDBBAA] hover:border-[#D97706] hover:text-white disabled:opacity-50";
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

function asInitialHtml(content: string) {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/[&<>"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[character] || character).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export default function RichContentEditor({ name, initialContent = "" }: RichContentEditorProps) {
  const [html, setHtml] = useState(() => asInitialHtml(initialContent));
  const [sourceMode, setSourceMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function syncRichValue() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncRichValue();
  }

  function insertHtml(value: string) {
    setError("");
    if (sourceMode) {
      const source = sourceRef.current;
      if (!source) {
        setHtml((current) => `${current}${value}`);
        return;
      }
      const start = source.selectionStart;
      const end = source.selectionEnd;
      const next = `${html.slice(0, start)}${value}${html.slice(end)}`;
      setHtml(next);
      requestAnimationFrame(() => {
        source.focus();
        source.setSelectionRange(start + value.length, start + value.length);
      });
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.contains(selection.anchorNode)) {
      document.execCommand("insertHTML", false, value);
    } else {
      editor.insertAdjacentHTML("beforeend", value);
    }
    syncRichValue();
  }

  async function upload(file: File | undefined, kind: "image" | "file") {
    if (!file) return;
    setError("");
    if (file.size > 10 * 1024 * 1024) {
      setError("Tệp không được vượt quá 10MB.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/media", { method: "POST", body: form });
      const payload = await response.json() as { url?: string; filename?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Không thể tải tệp lên.");
      if (kind === "image") {
        const escapedName = (payload.filename || file.name).replace(/[&<>"']/g, "");
        insertHtml(`<p><img src="${payload.url}" alt="${escapedName}"></p>`);
      } else {
        const label = (payload.filename || file.name).replace(/[&<>"']/g, "");
        insertHtml(`<p><a href="${payload.url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải tệp lên.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function preventToolbarFocus(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  const tools = [
    { label: "In đậm", icon: <Bold className="h-4 w-4" />, command: "bold" },
    { label: "In nghiêng", icon: <Italic className="h-4 w-4" />, command: "italic" },
    { label: "Gạch chân", icon: <Underline className="h-4 w-4" />, command: "underline" },
    { label: "Danh sách", icon: <List className="h-4 w-4" />, command: "insertUnorderedList" },
    { label: "Danh sách đánh số", icon: <ListOrdered className="h-4 w-4" />, command: "insertOrderedList" },
    { label: "Trích dẫn", icon: <Quote className="h-4 w-4" />, command: "formatBlock", value: "blockquote" },
  ];

  return (
    <div className="grid gap-2">
      <span className="font-semibold">Nội dung</span>
      <input type="hidden" name={name} value={html} />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void upload(event.currentTarget.files?.[0], "image")} />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={(event) => void upload(event.currentTarget.files?.[0], "file")} />
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-[#3A302B] bg-[#1D1916] p-2">
        {tools.map((tool) => (
          <button key={tool.label} type="button" aria-label={tool.label} title={tool.label} className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand(tool.command, tool.value)}>
            {tool.icon}
          </button>
        ))}
        <label className="sr-only" htmlFor="content-heading">Kiểu tiêu đề</label>
        <select id="content-heading" aria-label="Kiểu đoạn văn" className="h-9 rounded-md border border-[#3A302B] bg-[#221D1A] px-2 text-xs text-[#CDBBAA]" onChange={(event) => event.target.value && runCommand("formatBlock", event.target.value)}>
          <option value="">Đoạn văn</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
          <option value="pre">Mã / định dạng sẵn</option>
        </select>
        <button type="button" aria-label="Chèn liên kết" title="Chèn liên kết" className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => {
          const url = window.prompt("Nhập URL liên kết (https://...):");
          if (url) runCommand("createLink", url);
        }}>
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Chèn ảnh" title="Chèn ảnh (tối đa 10MB)" className={toolbarButtonClass} disabled={uploading} onMouseDown={preventToolbarFocus} onClick={() => imageInputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Đính kèm tệp" title="Đính kèm PDF, DOCX, XLSX, TXT hoặc CSV (tối đa 10MB)" className={toolbarButtonClass} disabled={uploading} onMouseDown={preventToolbarFocus} onClick={() => fileInputRef.current?.click()}>
          <FilePlus2 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-[#3A302B]" />
        <button type="button" aria-label="Hoàn tác" title="Hoàn tác" className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand("undo")}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Làm lại" title="Làm lại" className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand("redo")}>
          <RotateCw className="h-4 w-4" />
        </button>
        <button type="button" aria-pressed={sourceMode} title="Chỉnh sửa HTML" className={`${toolbarButtonClass} ${sourceMode ? "border-[#D97706] text-[#D97706]" : ""}`} onMouseDown={preventToolbarFocus} onClick={() => {
          if (!sourceMode) syncRichValue();
          setSourceMode((current) => !current);
        }}>
          <Code2 className="h-4 w-4" />
        </button>
      </div>
      {sourceMode ? (
        <textarea
          ref={sourceRef}
          aria-label="Mã HTML nội dung"
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          rows={16}
          className={`${editorClass} resize-y font-mono text-xs`}
          placeholder="<p>Nhập HTML tại đây...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          role="textbox"
          aria-label="Nội dung bài viết"
          aria-multiline="true"
          contentEditable={!uploading}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: html }}
          onInput={syncRichValue}
          className={`${editorClass} cms-rich-editor`}
        />
      )}
      <p className="text-[11px] text-[#81746B]">
        {uploading ? "Đang tải tệp lên..." : "Có thể định dạng nội dung, chỉnh HTML, chèn ảnh và đính kèm PDF/DOCX/XLSX/TXT/CSV (tối đa 10MB/tệp)."}
      </p>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
