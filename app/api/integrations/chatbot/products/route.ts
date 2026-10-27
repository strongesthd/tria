import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../../lib/prisma";
import { rateLimit, clientIp } from "../../../../../lib/rate-limit";
import { isValidWebhookSignature } from "../../../../../lib/novaseo-webhook";
import { SITE_URL } from "../../../../../lib/site-data";
import { chatbotProductSchema } from "../../../../../lib/chatbot-product-webhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000;

export async function POST(request: Request) {
  const secret = process.env.TRIA_CHATBOT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Chatbot product integration is not configured." }, { status: 503 });
  }

  const limit = rateLimit(`chatbot-product-publish:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many product publishing requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  if (!isValidWebhookSignature(rawBody, request.headers.get("x-tria-signature") || "", secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatbotProductSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product payload.", details: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
      { status: 400 },
    );
  }

  const productData = parsed.data;
  try {
    const [existing, slugOwner] = await Promise.all([
      prisma.product.findUnique({
        where: { sourceId: productData.sourceId },
        select: { id: true, slug: true },
      }),
      prisma.product.findUnique({
        where: { slug: productData.slug },
        select: { id: true },
      }),
    ]);

    if (slugOwner && slugOwner.id !== existing?.id) {
      return NextResponse.json({ error: "This product slug is already in use." }, { status: 409 });
    }

    const data = {
      slug: productData.slug,
      name: productData.name,
      category: productData.category,
      target: productData.target,
      price: productData.price,
      unit: productData.unit,
      priceOptions: productData.category === "beans" && productData.priceOptions.length
        ? productData.priceOptions
        : Prisma.DbNull,
      roastLevel: productData.roastLevel,
      notes: productData.notes,
      description: productData.description,
      image: productData.image || "/images/tria_logo.png",
      images: productData.images.filter(Boolean),
      active: productData.active,
    };

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data, select: { id: true, slug: true, active: true } })
      : await prisma.product.create({
          data: { ...data, sourceId: productData.sourceId },
          select: { id: true, slug: true, active: true },
        });

    revalidatePath("/");
    revalidatePath("/san-pham");
    revalidatePath(`/san-pham/${product.slug}`);
    if (existing && existing.slug !== product.slug) revalidatePath(`/san-pham/${existing.slug}`);

    return NextResponse.json(
      {
        product: {
          sourceId: productData.sourceId,
          id: product.id,
          slug: product.slug,
          link: `${SITE_URL}/san-pham/${product.slug}`,
          active: product.active,
        },
      },
      { status: existing ? 200 : 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This product source or slug is already in use." }, { status: 409 });
    }
    console.error("[chatbot-product-publish] Failed to sync product.", error);
    return NextResponse.json({ error: "Could not publish the product." }, { status: 500 });
  }
}
