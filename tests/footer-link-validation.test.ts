import assert from "node:assert/strict";
import test from "node:test";
import { footerLinkSchema } from "../lib/validation";

const validLink = {
  section: "POLICY",
  label: "  Điều khoản sử dụng  ",
  href: " /phap-ly/dieu-khoan#noi-dung ",
  sortOrder: 10,
};

test("footer link validation trims text and accepts an internal route", () => {
  assert.deepEqual(footerLinkSchema.parse(validLink), {
    ...validLink,
    label: "Điều khoản sử dụng",
    href: "/phap-ly/dieu-khoan#noi-dung",
  });
});

test("footer link validation rejects external and protocol-relative URLs", () => {
  for (const href of ["https://example.com", "javascript:alert(1)", "//example.com/path", "/\\example.com"]) {
    assert.equal(footerLinkSchema.safeParse({ ...validLink, href }).success, false, href);
  }
});

test("footer link validation rejects invalid groups and out-of-range order", () => {
  assert.equal(footerLinkSchema.safeParse({ ...validLink, section: "ABOUT" }).success, false);
  assert.equal(footerLinkSchema.safeParse({ ...validLink, sortOrder: -1 }).success, false);
  assert.equal(footerLinkSchema.safeParse({ ...validLink, sortOrder: 1.5 }).success, false);
  assert.equal(footerLinkSchema.safeParse({ ...validLink, sortOrder: 10_000 }).success, false);
});

test("footer link validation enforces bounded labels and route length", () => {
  assert.equal(footerLinkSchema.safeParse({ ...validLink, label: "x" }).success, false);
  assert.equal(footerLinkSchema.safeParse({ ...validLink, label: "x".repeat(81) }).success, false);
  assert.equal(footerLinkSchema.safeParse({ ...validLink, href: `/${"x".repeat(300)}` }).success, false);
});
