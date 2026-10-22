import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function safeFilename(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\\/\u0000-\u001f\u007f]/g, "_")
    .replace(/[^\p{L}\p{N}._ -]/gu, "")
    .trim()
    .slice(0, 120) || "tep-tin";
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Bạn không có quyền tải tệp lên." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_FILE_SIZE + 64 * 1024) {
    return NextResponse.json({ error: "Tệp vượt quá giới hạn 10MB." }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) {
      return NextResponse.json({ error: "Vui lòng chọn tệp cần tải lên." }, { status: 400 });
    }
    if (value.size === 0 || value.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Tệp phải có dung lượng từ 1 byte đến 10MB." }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(value.type)) {
      return NextResponse.json({ error: "Định dạng chưa hỗ trợ. Dùng ảnh, PDF, TXT, CSV, DOCX hoặc XLSX." }, { status: 415 });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        filename: safeFilename(value.name),
        mimeType: value.type,
        size: value.size,
        data: Buffer.from(await value.arrayBuffer()),
      },
      select: { id: true, filename: true, mimeType: true, size: true },
    });
    return NextResponse.json({
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      url: `/api/media/${asset.id}`,
    }, { status: 201 });
  } catch (error) {
    console.error("[media-upload] Could not store uploaded file.", error);
    return NextResponse.json({ error: "Không thể lưu tệp. Vui lòng thử lại." }, { status: 500 });
  }
}
