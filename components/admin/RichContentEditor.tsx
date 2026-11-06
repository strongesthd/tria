"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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
  label?: string;
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

export default function RichContentEditor({ name, label = "Nội dung", initialContent = "" }: RichContentEditorProps) {
  const [html, setHtml] = useState(() => asInitialHtml(initialContent));
  const [sourceMode, setSourceMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertionMarkerRef = useRef<string | null>(null);
  const sourceSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const cancelFilePickerRef = useRef<() => void>(() => {});

  function syncRichValue() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncRichValue();
  }

  function findInsertionMarker(editor: HTMLElement) {
    const markerId = insertionMarkerRef.current;
    if (!markerId) return null;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_COMMENT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeValue === markerId) return node;
      node = walker.nextNode();
    }
    return null;
  }

  function removeInsertionMarker(restoreCaret = false) {
    const editor = editorRef.current;
    const marker = editor ? findInsertionMarker(editor) : null;
    insertionMarkerRef.current = null;
    if (!editor || !marker?.parentNode) return;
    const range = document.createRange();
    range.setStartBefore(marker);
    range.collapse(true);
    marker.parentNode.removeChild(marker);
    if (restoreCaret) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    syncRichValue();
  }

  function insertHtml(value: string): boolean {
    setError("");
    if (sourceMode) {
      const source = sourceRef.current;
      if (!source) return false;
      const { start, end } = sourceSelectionRef.current ?? {
        start: source.selectionStart,
        end: source.selectionEnd,
      };
      sourceSelectionRef.current = null;
      const next = `${html.slice(0, start)}${value}${html.slice(end)}`;
      if (next === html) return false;
      setHtml(next);
      requestAnimationFrame(() => {
        source.focus();
        source.setSelectionRange(start + value.length, start + value.length);
      });
      return true;
    }

    const editor = editorRef.current;
    if (!editor) return false;
    const previousHtml = editor.innerHTML;
    editor.focus();
    const selection = window.getSelection();
    const marker = findInsertionMarker(editor);
    if (!marker?.parentNode) {
      insertionMarkerRef.current = null;
      setError("Không thể khôi phục vị trí con trỏ. Hãy đặt con trỏ lại và chọn ảnh lần nữa.");
      return false;
    }
    const insertionRange = document.createRange();
    insertionRange.setStartBefore(marker);
    insertionRange.setEndAfter(marker);
    insertionRange.deleteContents();
    insertionMarkerRef.current = null;
    const fragment = insertionRange.createContextualFragment(value);
    const lastInsertedNode = fragment.lastChild;
    if (!lastInsertedNode) return false;
    insertionRange.insertNode(fragment);
    insertionRange.setStartAfter(lastInsertedNode);
    insertionRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(insertionRange);
    syncRichValue();
    return editor.innerHTML !== previousHtml;
  }

  function openFilePicker(kind: "image" | "file") {
    if (sourceMode) {
      const source = sourceRef.current;
      sourceSelectionRef.current = source
        ? { start: source.selectionStart, end: source.selectionEnd }
        : null;
    } else {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (editor) {
        removeInsertionMarker();
        const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const range = selectedRange
          && editor.contains(selectedRange.startContainer)
          && editor.contains(selectedRange.endContainer)
          ? selectedRange.cloneRange()
          : document.createRange();
        if (!selectedRange || !editor.contains(selectedRange.startContainer) || !editor.contains(selectedRange.endContainer)) {
          range.selectNodeContents(editor);
          range.collapse(false);
        } else {
          range.collapse(false);
        }
        const markerId = `rich-content-insertion:${crypto.randomUUID()}`;
        insertionMarkerRef.current = markerId;
        range.insertNode(document.createComment(markerId));
        syncRichValue();
      }
    }

    (kind === "image" ? imageInputRef : fileInputRef).current?.click();
  }

  function cancelFilePicker() {
    if (!sourceMode) removeInsertionMarker(true);
  }

  cancelFilePickerRef.current = cancelFilePicker;

  useEffect(() => {
    const handleCancel = () => cancelFilePickerRef.current();
    const inputs = [imageInputRef.current, fileInputRef.current];
    inputs.forEach((input) => input?.addEventListener("cancel", handleCancel));
    return () => inputs.forEach((input) => input?.removeEventListener("cancel", handleCancel));
  }, []);

  async function upload(file: File | undefined, kind: "image" | "file") {
    if (!file) return;
    setError("");
    setUploadStatus(`Đang tải lên: ${file.name}`);
    const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (kind === "image" && !acceptedImageTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF.");
      setUploadStatus("");
      if (!sourceMode) removeInsertionMarker(true);
      return;
    }
    if (kind === "file" && file.type.startsWith("image/") && !acceptedImageTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF.");
      setUploadStatus("");
      if (!sourceMode) removeInsertionMarker(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Tệp không được vượt quá 10MB.");
      setUploadStatus("");
      if (!sourceMode) removeInsertionMarker(true);
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
        if (!insertHtml(`<p><img src="${payload.url}" alt="${escapedName}"></p>`)) {
          throw new Error("Ảnh đã tải lên nhưng không chèn được vào nội dung. Hãy thử lại.");
        }
      } else {
        const label = (payload.filename || file.name).replace(/[&<>"']/g, "");
        if (!insertHtml(`<p><a href="${payload.url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`)) {
          throw new Error("Tệp đã tải lên nhưng không chèn được vào nội dung. Hãy thử lại.");
        }
      }
      setUploadStatus(kind === "image" ? "Đã tải ảnh lên và chèn vào nội dung." : "Đã tải tệp lên và chèn vào nội dung.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải tệp lên.");
      setUploadStatus("");
      if (!sourceMode) removeInsertionMarker(true);
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
      <span className="font-semibold">{label}</span>
      <input type="hidden" name={name} value={html.replace(/<!--rich-content-insertion:[\s\S]*?-->/g, "")} />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void upload(file, "image"); }} />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void upload(file, "file"); }} />
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
        <button type="button" aria-label="Chèn ảnh" title="Chèn ảnh (tối đa 10MB)" className={toolbarButtonClass} disabled={uploading} onMouseDown={preventToolbarFocus} onClick={() => openFilePicker("image")}>
          <ImagePlus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Đính kèm tệp" title="Đính kèm PDF, DOCX, XLSX, TXT hoặc CSV (tối đa 10MB)" className={toolbarButtonClass} disabled={uploading} onMouseDown={preventToolbarFocus} onClick={() => openFilePicker("file")}>
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
        {uploading && <span role="status" aria-live="polite" className="px-2 text-xs text-[#E2A168]">Đang tải tệp lên...</span>}
        {!uploading && uploadStatus && <span role="status" aria-live="polite" className="px-2 text-xs text-emerald-400">{uploadStatus}</span>}
        {error && <span role="alert" className="px-2 text-xs text-red-400">{error}</span>}
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
    </div>
  );
}
