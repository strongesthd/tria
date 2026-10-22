import { prisma } from "../../../../lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { filename: true, mimeType: true, size: true, data: true },
  });
  if (!asset) return new Response("Not found", { status: 404 });

  const isImage = asset.mimeType.startsWith("image/");
  const disposition = isImage ? "inline" : "attachment";
  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.size),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(asset.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
