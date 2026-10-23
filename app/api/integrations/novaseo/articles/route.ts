import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { rateLimit, clientIp } from "../../../../../lib/rate-limit";
import { sanitizeContentHtml } from "../../../../../lib/sanitize-content";
import { SITE_URL } from "../../../../../lib/site-data";
import { isValidNovaSeoSignature } from "../../../../../lib/novaseo-webhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1_000_000;
const articleSchema = z.object({
  platform: z.literal("webhook"),
  visibility: z.literal("public"),
  contentId: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  seoTitle: z.string().trim().min(1).max(180),
  metaDescription: z.string().trim().min(1).max(300),
  focusKeyword: z.string().trim().min(1).max(100),
  secondaryKeywords: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().trim().min(1).max(100_000),
}).strict();

export async function POST(request: Request) {
  const secret = process.env.NOVASEO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "NovaSEO integration is not configured." }, { status: 503 });
  }

  const limit = rateLimit(`novaseo-publish:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many publishing requests." },
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

  const signature = request.headers.get("x-novaseo-signature") || "";
  if (!isValidNovaSeoSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = articleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid article payload.", details: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
      { status: 400 },
    );
  }

  const articleData = parsed.data;
  const content = sanitizeContentHtml(articleData.content);
  if (!content.trim()) {
    return NextResponse.json({ error: "Article content is empty after sanitization." }, { status: 400 });
  }

  try {
    const existing = await prisma.newsArticle.findUnique({
      where: { sourceId: articleData.contentId },
      select: { id: true, slug: true, publishedAt: true },
    });
    const slugOwner = await prisma.newsArticle.findUnique({
      where: { slug: articleData.slug },
      select: { id: true },
    });
    if (slugOwner && slugOwner.id !== existing?.id) {
      return NextResponse.json({ error: "This article slug is already in use." }, { status: 409 });
    }

    const article = existing
      ? await prisma.newsArticle.update({
          where: { id: existing.id },
          data: {
            title: articleData.title,
            slug: articleData.slug,
            excerpt: articleData.metaDescription,
            seoTitle: articleData.seoTitle,
            metaDescription: articleData.metaDescription,
            focusKeyword: articleData.focusKeyword,
            secondaryKeywords: articleData.secondaryKeywords,
            content,
            published: true,
            publishedAt: existing.publishedAt || new Date(),
          },
          select: { id: true, slug: true, publishedAt: true },
        })
      : await prisma.newsArticle.create({
          data: {
            sourceId: articleData.contentId,
            title: articleData.title,
            slug: articleData.slug,
            excerpt: articleData.metaDescription,
            seoTitle: articleData.seoTitle,
            metaDescription: articleData.metaDescription,
            focusKeyword: articleData.focusKeyword,
            secondaryKeywords: articleData.secondaryKeywords,
            content,
            published: true,
            publishedAt: new Date(),
          },
          select: { id: true, slug: true, publishedAt: true },
        });

    const url = `${SITE_URL}/tin-tuc/${article.slug}`;
    revalidatePath("/");
    revalidatePath("/tin-tuc");
    if (existing && existing.slug !== article.slug) revalidatePath(`/tin-tuc/${existing.slug}`);
    revalidatePath(`/tin-tuc/${article.slug}`);
    return NextResponse.json(
      { article: { id: articleData.contentId, triaId: article.id, slug: article.slug, link: url, publishedAt: article.publishedAt?.toISOString() } },
      { status: existing ? 200 : 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This article slug or source is already in use." }, { status: 409 });
    }
    console.error("[novaseo-publish] Failed to publish article.", error);
    return NextResponse.json({ error: "Could not publish the article." }, { status: 500 });
  }
}
