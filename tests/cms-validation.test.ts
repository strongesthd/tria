import assert from "node:assert/strict";
import test from "node:test";
import { cmsPageSchema, newsArticleSchema } from "../lib/validation";

const validPage = {
  title: "  Điều khoản sử dụng ",
  slug: "dieu-khoan-su-dung",
  summary: "",
  content: "Nội dung trang",
  footerSection: "POLICY",
  sortOrder: 1,
  published: true,
};

test("CMS page validation trims fields and supports Footer placement", () => {
  assert.deepEqual(cmsPageSchema.parse(validPage), {
    ...validPage,
    title: "Điều khoản sử dụng",
  });
});

test("CMS page validation requires non-empty content and safe slugs", () => {
  assert.equal(cmsPageSchema.safeParse({ ...validPage, content: " " }).success, false);
  assert.equal(cmsPageSchema.safeParse({ ...validPage, slug: "../admin" }).success, false);
  assert.equal(cmsPageSchema.safeParse({ ...validPage, footerSection: "EXTERNAL" }).success, false);
});

test("News article validation enforces content and uploaded image types", () => {
  const article = {
    title: "TRIA ra mắt sản phẩm mới",
    slug: "tria-ra-mat-san-pham-moi",
    excerpt: "",
    content: "Chi tiết bài viết",
    image: null,
    published: false,
  };
  assert.equal(newsArticleSchema.safeParse(article).success, true);
  assert.equal(newsArticleSchema.safeParse({ ...article, image: "data:text/html;base64,SGVsbG8=" }).success, false);
  assert.equal(newsArticleSchema.safeParse({ ...article, content: "" }).success, false);
});
