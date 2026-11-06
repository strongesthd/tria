import assert from "node:assert/strict";
import test from "node:test";
import { buildProductJsonLd, getProductImageUrls, PRODUCTS } from "../lib/site-data";

test("product schema includes only absolute HTTP image URLs", () => {
  assert.deepEqual(
    getProductImageUrls({
      image: "data:image/jpeg;base64,Zm9v",
      images: ["/api/media/asset-1", "https://cdn.example.com/product.jpg", "javascript:alert(1)"],
    }),
    ["https://triacafe.vn/api/media/asset-1", "https://cdn.example.com/product.jpg"],
  );
});

test("product schema omits images when only inline data is available", () => {
  const product = { ...PRODUCTS[0], image: "data:image/jpeg;base64,Zm9v", images: [] };
  assert.equal("image" in buildProductJsonLd(product), false);
});
