import assert from "node:assert/strict";
import test from "node:test";
import {
  formatProductPriceOptions,
  getBeanPriceOptions,
  parseProductPriceOptions,
  parseProductPriceOptionsInput,
} from "../lib/product-pricing";

test("parses valid bean price options and keeps their explicit prices", () => {
  assert.deepEqual(parseProductPriceOptionsInput("250g: 185000\n500g: 280000\n1kg: 405000", "250g", 185000, "beans"), [
    { unit: "250g", price: 185000 },
    { unit: "500g", price: 280000 },
    { unit: "1kg", price: 405000 },
  ]);
});

test("rejects malformed, duplicate, excessive, or invalid price options", () => {
  for (const value of ["500g 280000", "250g: 185000\n250G: 200000", "250g: 0", Array(7).fill("250g: 1").join("\n")]) {
    assert.throws(() => parseProductPriceOptionsInput(value, "250g", 185000, "beans"));
  }
});

test("non-bean products do not receive bean price options", () => {
  assert.equal(parseProductPriceOptionsInput("250g: 185000", "250g", 185000, "machines"), null);
});

test("legacy bean products retain existing default weight pricing", () => {
  assert.deepEqual(getBeanPriceOptions(185000), [
    { unit: "250g", price: 185000 },
    { unit: "500g", price: 280000 },
    { unit: "1kg", price: 405000 },
  ]);
});

test("valid stored options override legacy defaults and invalid values fall back", () => {
  const configured = [{ unit: "200g", price: 175000 }, { unit: "1kg", price: 700000 }];
  assert.deepEqual(getBeanPriceOptions(185000, configured), configured);
  assert.deepEqual(parseProductPriceOptions([{ unit: "250g", price: -1 }]), []);
  assert.equal(formatProductPriceOptions(configured, 185000), "200g: 175000\n1kg: 700000");
});
