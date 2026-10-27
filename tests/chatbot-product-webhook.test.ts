import assert from "node:assert/strict";
import test from "node:test";
import { chatbotProductSchema } from "../lib/chatbot-product-webhook";

const validProduct = {
  sourceId: "wbp_123456",
  slug: "tria-fine-robusta",
  name: "TRIA Fine Robusta",
  category: "beans",
  target: "b2c",
  price: 185000,
  unit: "250g",
  priceOptions: [
    { unit: "250g", price: 185000 },
    { unit: "500g", price: 280000 },
  ],
  roastLevel: "Medium Roast",
  notes: "Chocolate, caramel",
  description: "Cà phê Robusta rang tươi.",
  image: "https://chatbot.novatechhp.vn/uploads/product-images/tenant/product.jpg",
  images: [],
  active: true,
};

test("validates the signed chatbot product integration payload", () => {
  assert.deepEqual(chatbotProductSchema.parse(validProduct), validProduct);
});

test("requires valid product fields and supported image sources", () => {
  assert.equal(chatbotProductSchema.safeParse({ ...validProduct, slug: "../bad" }).success, false);
  assert.equal(chatbotProductSchema.safeParse({ ...validProduct, price: 0 }).success, false);
  assert.equal(chatbotProductSchema.safeParse({ ...validProduct, image: "http://example.com/image.jpg" }).success, false);
  assert.equal(chatbotProductSchema.safeParse({ ...validProduct, extra: true }).success, false);
});

test("rejects duplicated product option units", () => {
  assert.equal(chatbotProductSchema.safeParse({
    ...validProduct,
    priceOptions: [{ unit: "250g", price: 185000 }, { unit: "250G", price: 190000 }],
  }).success, false);
});
