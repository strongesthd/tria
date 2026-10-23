import assert from "node:assert/strict";
import test from "node:test";
import { cmsPageContentSchema, cmsPageFooterSettingsSchema, newsArticleSchema } from "../lib/validation";
import { sanitizeContentHtml } from "../lib/sanitize-content";
import { createHmac } from "node:crypto";
import { isValidNovaSeoSignature } from "../lib/novaseo-webhook";

const validPageContent = {
  title: "  Điều khoản sử dụng ",
  summary: "",
  content: "Nội dung trang",
};
const validPageSettings = {
  slug: "dieu-khoan-su-dung",
  footerSection: "POLICY",
  sortOrder: 1,
  published: true,
};

test("CMS page content validation accepts only editable content fields", () => {
  assert.deepEqual(cmsPageContentSchema.parse(validPageContent), {
    ...validPageContent,
    title: "Điều khoản sử dụng",
  });
  assert.equal(cmsPageContentSchema.safeParse({ ...validPageContent, ...validPageSettings }).success, false);
});

test("CMS Footer settings validation accepts only safe placement metadata", () => {
  assert.deepEqual(cmsPageFooterSettingsSchema.parse(validPageSettings), validPageSettings);
  assert.equal(cmsPageContentSchema.safeParse({ ...validPageContent, content: " " }).success, false);
  assert.equal(cmsPageFooterSettingsSchema.safeParse({ ...validPageSettings, slug: "../admin" }).success, false);
  assert.equal(cmsPageFooterSettingsSchema.safeParse({ ...validPageSettings, footerSection: "EXTERNAL" }).success, false);
  assert.equal(cmsPageFooterSettingsSchema.safeParse({ ...validPageSettings, title: "Other title" }).success, false);
});

test("News article validation enforces content and uploaded image types", () => {
  const article = {
    title: "TRIA ra mắt sản phẩm mới",
    slug: "tria-ra-mat-san-pham-moi",
    excerpt: "",
    seoTitle: "",
    metaDescription: "",
    focusKeyword: "",
    secondaryKeywords: "",
    content: "Chi tiết bài viết",
    image: null,
    published: false,
  };
  assert.equal(newsArticleSchema.safeParse(article).success, true);
  assert.equal(newsArticleSchema.safeParse({ ...article, published: true }).success, false);
  assert.equal(newsArticleSchema.safeParse({
    ...article,
    published: true,
    seoTitle: "TRIA ra mắt sản phẩm mới",
    metaDescription: "Khám phá sản phẩm mới từ TRIA.",
    focusKeyword: "sản phẩm TRIA",
    secondaryKeywords: "cà phê, thiết bị pha chế",
  }).success, true);
  assert.equal(newsArticleSchema.safeParse({ ...article, image: "data:text/html;base64,SGVsbG8=" }).success, false);
  assert.equal(newsArticleSchema.safeParse({ ...article, content: "" }).success, false);
});

test("rich content keeps formatting and local media while stripping executable HTML", () => {
  const safe = sanitizeContentHtml(
    '<h2>Hello</h2><p><strong>Text</strong><img src="/api/media/abc123" onerror="alert(1)"></p><script>alert(1)</script><a href="javascript:alert(1)">bad link</a>'
  );
  assert.match(safe, /<h2>Hello<\/h2>/);
  assert.match(safe, /<strong>Text<\/strong>/);
  assert.match(safe, /src="\/api\/media\/abc123"/);
  assert.doesNotMatch(safe, /onerror|<script|javascript:/i);
});

test("NovaSEO webhook signatures validate the exact request body", () => {
  const body = JSON.stringify({ title: "Article", slug: "article" });
  const signature = createHmac("sha256", "shared-secret").update(body).digest("hex");
  assert.equal(isValidNovaSeoSignature(body, signature, "shared-secret"), true);
  assert.equal(isValidNovaSeoSignature(`${body} `, signature, "shared-secret"), false);
  assert.equal(isValidNovaSeoSignature(body, signature, "wrong-secret"), false);
  assert.equal(isValidNovaSeoSignature(body, "invalid", "shared-secret"), false);
});
