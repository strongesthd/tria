"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

type ImageUploadButtonProps = {
  label: string;
  multiple?: boolean;
  onSelect: (images: string[]) => void;
};

export default function ImageUploadButton({ label, multiple = false, onSelect }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function readFiles(files: FileList | null) {
    setError("");
    const selected = Array.from(files || []);
    if (!selected.length) return;
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Mỗi ảnh không được vượt quá 5MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      const images = await Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không đọc được ảnh."));
        reader.onerror = () => reject(new Error("Không đọc được ảnh."));
        reader.readAsDataURL(file);
      })));
      onSelect(images);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đọc được ảnh.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        className="hidden"
        onChange={(event) => void readFiles(event.currentTarget.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#4A3B31] p-2 text-left text-xs text-[#A69B93] hover:border-[#D97706]"
      >
        <ImagePlus className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden />
        {label}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
