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
  Trash2,
  Underline,
} from "lucide-react";

type RichContentEditorProps = {
  name: string;
  label?: string;
  initialContent?: string;
};

type PendingImage = {
  file: File;
  width: number;
  height: number;
  alt: string;
  title: string;
  caption: string;
  context: string;
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

function escapeHtmlAttribute(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function plainTextFromHtml(value: string) {
  const container = document.createElement("div");
  container.innerHTML = value;
  return (container.textContent || "").replace(/\s+/g, " ").trim().slice(0, 250);
}

export default function RichContentEditor({ name, label = "Nội dung", initialContent = "" }: RichContentEditorProps) {
  const [html, setHtml] = useState(() => asInitialHtml(initialContent));
  const [sourceMode, setSourceMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertionMarkerRef = useRef<string | null>(null);
  const sourceSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const imageContextRef = useRef("");
  const cancelFilePickerRef = useRef<() => void>(() => {});

  function syncRichValue(updateEditorState = false) {
    if (editorRef.current) {
      const cleanEditor = editorRef.current.cloneNode(true) as HTMLDivElement;
      cleanEditor.querySelectorAll("[data-rich-editor-selected-image]").forEach((image) => {
        image.removeAttribute("data-rich-editor-selected-image");
      });
      const cleanHtml = cleanEditor.innerHTML;
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = cleanHtml.replace(/<!--rich-content-insertion:[\s\S]*?-->/g, "");
      }
      if (updateEditorState) setHtml(cleanHtml);
    }
    if (selectedImageRef.current && !editorRef.current?.contains(selectedImageRef.current)) {
      selectedImageRef.current = null;
      setHasSelectedImage(false);
    }
  }

  function selectImage(image: HTMLImageElement | null) {
    selectedImageRef.current?.removeAttribute("data-rich-editor-selected-image");
    const editor = editorRef.current;
    selectedImageRef.current = image && editor?.contains(image) ? image : null;
    selectedImageRef.current?.setAttribute("data-rich-editor-selected-image", "true");
    setHasSelectedImage(Boolean(selectedImageRef.current));
  }

  function deleteSelectedImage() {
    const image = selectedImageRef.current;
    if (!image || !editorRef.current?.contains(image)) {
      selectImage(null);
      return;
    }
    const figure = image.closest("figure");
    const paragraph = image.parentElement?.tagName === "P" ? image.parentElement : null;
    const nodeToRemove = figure || image;
    nodeToRemove.remove();
    if (!figure && paragraph && !paragraph.textContent?.trim() && !paragraph.querySelector("img, a, video, audio")) {
      paragraph.remove();
    }
    selectedImageRef.current = null;
    setHasSelectedImage(false);
    editorRef.current.focus();
    syncRichValue();
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
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = next.replace(/<!--rich-content-insertion:[\s\S]*?-->/g, "");
      }
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

  function getImageContext(range: Range) {
    const selectionText = range.toString().trim();
    const contextNode = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer as Element
      : range.commonAncestorContainer.parentElement;
    const contextBlock = contextNode?.closest("p, h1, h2, h3, h4, h5, h6, li, blockquote");
    return (selectionText || contextBlock?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 250);
  }

  function rememberImageContext() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
      imageContextRef.current = getImageContext(range);
    }
  }

  function openFilePicker(kind: "image" | "file") {
    if (sourceMode) {
      const source = sourceRef.current;
      sourceSelectionRef.current = source
        ? { start: source.selectionStart, end: source.selectionEnd }
        : null;
      imageContextRef.current = source
        ? plainTextFromHtml(html.slice(source.selectionStart, source.selectionEnd))
          || plainTextFromHtml(html.slice(Math.max(0, source.selectionStart - 400), source.selectionEnd + 400))
        : "";
    } else {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (editor) {
        const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const rangeIsInEditor = Boolean(selectedRange
          && editor.contains(selectedRange.startContainer)
          && editor.contains(selectedRange.endContainer));
        if (rangeIsInEditor && selectedRange) imageContextRef.current = getImageContext(selectedRange);
        removeInsertionMarker();
        const currentSelection = window.getSelection();
        const currentRange = currentSelection?.rangeCount ? currentSelection.getRangeAt(0) : null;
        const currentRangeIsInEditor = Boolean(currentRange
          && editor.contains(currentRange.startContainer)
          && editor.contains(currentRange.endContainer));
        const range = currentRange
          && currentRangeIsInEditor
          ? currentRange.cloneRange()
          : document.createRange();
        if (!currentRange || !currentRangeIsInEditor) {
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

  function cancelPendingImage() {
    setPendingImage(null);
    removeInsertionMarker(true);
  }

  cancelFilePickerRef.current = cancelFilePicker;

  useEffect(() => {
    const handleCancel = () => cancelFilePickerRef.current();
    const inputs = [imageInputRef.current, fileInputRef.current];
    inputs.forEach((input) => input?.addEventListener("cancel", handleCancel));
    return () => inputs.forEach((input) => input?.removeEventListener("cancel", handleCancel));
  }, []);

  async function prepareImage(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploadStatus("");
    const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!acceptedImageTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF.");
      if (!sourceMode) removeInsertionMarker(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Tệp không được vượt quá 10MB.");
      if (!sourceMode) removeInsertionMarker(true);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("Không đọc được kích thước ảnh. Hãy thử ảnh khác."));
        image.src = objectUrl;
      });
      setPendingImage({
        file,
        width,
        height,
        alt: imageContextRef.current,
        title: imageContextRef.current,
        caption: "",
        context: imageContextRef.current,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đọc được ảnh.");
      if (!sourceMode) removeInsertionMarker(true);
    } finally {
      URL.revokeObjectURL(objectUrl);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function upload(file: File | undefined, kind: "image" | "file", imageMetadata?: PendingImage) {
    if (!file) return;
    setError("");
    setUploadStatus(`Đang tải lên: ${file.name}`);
    if (kind === "image") {
      if (!imageMetadata) {
        setError("Hãy chọn ảnh và nhập thông tin SEO trước khi tải lên.");
        setUploadStatus("");
        return;
      }
      if (!imageMetadata.alt.trim()) {
        setError("Hãy nhập nội dung mô tả ở trường Alt trước khi tải ảnh lên.");
        setUploadStatus("");
        return;
      }
    }
    if (kind === "file" && file.type.startsWith("image/") && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
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
      const payload = await response.json() as { url?: string; filename?: string; size?: number; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Không thể tải tệp lên.");
      if (kind === "image") {
        if (!imageMetadata) throw new Error("Thiếu thông tin SEO của ảnh.");
        const metadata = imageMetadata;
        const imageUrl = new URL(payload.url, window.location.origin).href;
        const titleAttribute = metadata.title.trim()
          ? ` title="${escapeHtmlAttribute(metadata.title.trim())}"`
          : "";
        const caption = metadata.caption.trim()
          ? `<figcaption>${escapeHtmlAttribute(metadata.caption.trim())}</figcaption>`
          : "";
        const imageHtml = `<figure><img src="${escapeHtmlAttribute(imageUrl)}" alt="${escapeHtmlAttribute(metadata.alt.trim())}"${titleAttribute} width="${metadata.width}" height="${metadata.height}" loading="lazy" decoding="async">${caption}</figure>`;
        if (!insertHtml(imageHtml)) {
          throw new Error("Ảnh đã tải lên nhưng không chèn được vào nội dung. Hãy thử lại.");
        }
        setPendingImage(null);
        setUploadStatus(`Đã tải và chèn ảnh (${metadata.width} × ${metadata.height}px, ${formatFileSize(payload.size ?? file.size)}): ${imageUrl}`);
      } else {
        const label = escapeHtmlAttribute(payload.filename || file.name);
        if (!insertHtml(`<p><a href="${payload.url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`)) {
          throw new Error("Tệp đã tải lên nhưng không chèn được vào nội dung. Hãy thử lại.");
        }
      }
      if (kind === "file") setUploadStatus("Đã tải tệp lên và chèn vào nội dung.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải tệp lên.");
      setUploadStatus("");
      if (!sourceMode && kind === "file") removeInsertionMarker(true);
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
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        defaultValue={html.replace(/<!--rich-content-insertion:[\s\S]*?-->/g, "")}
      />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void prepareImage(file); }} />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void upload(file, "file"); }} />
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-[#3A302B] bg-[#1D1916] p-2">
        {tools.map((tool) => (
          <button key={tool.label} type="button" aria-label={tool.label} title={tool.label} disabled={Boolean(pendingImage) || uploading} className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand(tool.command, tool.value)}>
            {tool.icon}
          </button>
        ))}
        <label className="sr-only" htmlFor="content-heading">Kiểu tiêu đề</label>
        <select id="content-heading" aria-label="Kiểu đoạn văn" disabled={Boolean(pendingImage) || uploading} className="h-9 rounded-md border border-[#3A302B] bg-[#221D1A] px-2 text-xs text-[#CDBBAA]" onChange={(event) => event.target.value && runCommand("formatBlock", event.target.value)}>
          <option value="">Đoạn văn</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
          <option value="pre">Mã / định dạng sẵn</option>
        </select>
        <button type="button" aria-label="Chèn liên kết" title="Chèn liên kết" disabled={Boolean(pendingImage) || uploading} className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => {
          const url = window.prompt("Nhập URL liên kết (https://...):");
          if (url) runCommand("createLink", url);
        }}>
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Chèn ảnh" title="Chèn ảnh (tối đa 10MB)" className={toolbarButtonClass} disabled={Boolean(pendingImage) || uploading} onMouseDown={preventToolbarFocus} onClick={() => openFilePicker("image")}>
          <ImagePlus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Đính kèm tệp" title="Đính kèm PDF, DOCX, XLSX, TXT hoặc CSV (tối đa 10MB)" className={toolbarButtonClass} disabled={Boolean(pendingImage) || uploading} onMouseDown={preventToolbarFocus} onClick={() => openFilePicker("file")}>
          <FilePlus2 className="h-4 w-4" />
        </button>
        {hasSelectedImage && (
          <button type="button" aria-label="Xóa ảnh đang chọn" title="Xóa ảnh đang chọn" className={`${toolbarButtonClass} w-auto gap-1 px-2 text-red-400`} disabled={Boolean(pendingImage) || uploading} onMouseDown={preventToolbarFocus} onClick={deleteSelectedImage}>
            <Trash2 className="h-4 w-4" />
            <span className="text-xs">Xóa ảnh</span>
          </button>
        )}
        <span className="mx-1 h-6 w-px bg-[#3A302B]" />
        <button type="button" aria-label="Hoàn tác" title="Hoàn tác" disabled={Boolean(pendingImage) || uploading} className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand("undo")}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Làm lại" title="Làm lại" disabled={Boolean(pendingImage) || uploading} className={toolbarButtonClass} onMouseDown={preventToolbarFocus} onClick={() => runCommand("redo")}>
          <RotateCw className="h-4 w-4" />
        </button>
        <button type="button" aria-pressed={sourceMode} title="Chỉnh sửa HTML" disabled={Boolean(pendingImage) || uploading} className={`${toolbarButtonClass} ${sourceMode ? "border-[#D97706] text-[#D97706]" : ""}`} onMouseDown={preventToolbarFocus} onClick={() => {
          if (!sourceMode) syncRichValue(true);
          setSourceMode((current) => !current);
        }}>
          <Code2 className="h-4 w-4" />
        </button>
        {uploading && <span role="status" aria-live="polite" className="px-2 text-xs text-[#E2A168]">Đang tải tệp lên...</span>}
        {!uploading && uploadStatus && <span role="status" aria-live="polite" className="max-w-full break-all px-2 text-xs text-emerald-400">{uploadStatus}</span>}
        {error && <span role="alert" className="px-2 text-xs text-red-400">{error}</span>}
      </div>
      {pendingImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) cancelPendingImage();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !uploading) cancelPendingImage();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="rich-image-dialog-title"
            className="grid max-h-[90vh] w-full max-w-xl gap-4 overflow-y-auto rounded-xl border border-[#4A3B31] bg-[#1D1916] p-5 shadow-2xl"
          >
            <div>
              <h3 id="rich-image-dialog-title" className="text-base font-bold text-white">Thông tin ảnh trước khi chèn</h3>
              <p className="mt-1 text-xs text-[#A69B93]">
                {pendingImage.file.name} · {pendingImage.width} × {pendingImage.height}px · {formatFileSize(pendingImage.file.size)}
              </p>
              <p className="mt-1 text-xs text-[#81746B]">
                Alt và Title được gợi ý tự động từ nội dung tại vị trí chèn. Kiểm tra nhanh để bảo đảm mô tả đúng ảnh; meta description/OG được cấu hình ở SEO của trang.
              </p>
              {pendingImage.context && (
                <p className="mt-2 rounded-md border border-[#3A302B] bg-[#221D1A] p-2 text-xs text-[#CDBBAA]">
                  Gợi ý lấy từ nội dung tại vị trí chèn: “{pendingImage.context}”
                </p>
              )}
            </div>
            <label className="grid gap-1 text-xs font-semibold text-[#CDBBAA]">
              Alt text (bắt buộc, tự gợi ý từ nội dung)
              <input
                autoFocus
                required
                maxLength={250}
                value={pendingImage.alt}
                onChange={(event) => setPendingImage({ ...pendingImage, alt: event.target.value })}
                placeholder="Đặt con trỏ trong đoạn liên quan để tự gợi ý"
                className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-sm text-white outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-[#CDBBAA]">
              Title (không bắt buộc, tự gợi ý từ nội dung)
              <input
                maxLength={250}
                value={pendingImage.title}
                onChange={(event) => setPendingImage({ ...pendingImage, title: event.target.value })}
                placeholder="Tiêu đề ảnh"
                className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-sm text-white outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-[#CDBBAA]">
              Chú thích ảnh (không bắt buộc)
              <input
                maxLength={500}
                value={pendingImage.caption}
                onChange={(event) => setPendingImage({ ...pendingImage, caption: event.target.value })}
                placeholder="Chú thích hiển thị bên dưới ảnh"
                className="rounded-lg border border-[#3A302B] bg-[#221D1A] px-3 py-2 text-sm text-white outline-none focus:border-[#D97706]"
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" disabled={uploading} onClick={cancelPendingImage} className="rounded-lg border border-[#4A3B31] px-4 py-2 text-xs font-semibold text-[#CDBBAA] disabled:opacity-50">
                Hủy
              </button>
              <button type="button" disabled={uploading || !pendingImage.alt.trim()} onClick={() => void upload(pendingImage.file, "image", pendingImage)} className="rounded-lg bg-[#D97706] px-4 py-2 text-xs font-bold text-[#1C1613] disabled:opacity-50">
                {uploading ? "Đang tải ảnh..." : "Tải lên & chèn ảnh"}
              </button>
            </div>
          </section>
        </div>
      )}
      {sourceMode ? (
        <textarea
          ref={sourceRef}
          aria-label="Mã HTML nội dung"
          value={html}
          onChange={(event) => {
            setHtml(event.target.value);
            if (hiddenInputRef.current) {
              hiddenInputRef.current.value = event.target.value.replace(/<!--rich-content-insertion:[\s\S]*?-->/g, "");
            }
          }}
          disabled={Boolean(pendingImage) || uploading}
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
          contentEditable={!uploading && !pendingImage}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: html }}
          onInput={() => syncRichValue()}
          onClick={(event) => {
            const target = event.target;
            selectImage(target instanceof HTMLImageElement ? target : null);
          }}
          onKeyDown={(event) => {
            if ((event.key === "Backspace" || event.key === "Delete") && selectedImageRef.current) {
              event.preventDefault();
              deleteSelectedImage();
            }
          }}
          onMouseUp={rememberImageContext}
          onKeyUp={rememberImageContext}
          className={`${editorClass} cms-rich-editor`}
        />
      )}
      <p className="text-[11px] text-[#81746B]">
        {uploading ? "Đang tải tệp lên..." : "Có thể định dạng nội dung, chỉnh HTML, chèn ảnh và đính kèm PDF/DOCX/XLSX/TXT/CSV (tối đa 10MB/tệp)."}
      </p>
    </div>
  );
}
