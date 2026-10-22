import assert from "node:assert/strict";
import test from "node:test";
import { buildFooterCategories } from "../lib/footer-data-utils";

test("footer categories are unique, sorted, and use the DB category in their route", () => {
  const categories = buildFooterCategories([
    { category: "machines" },
    { category: "beans" },
    { category: "machines" },
    { category: "seasonal coffee & tools" },
    { category: "" },
  ]);

  assert.deepEqual(
    categories.map(({ id }) => id),
    ["beans", "machines", "seasonal coffee & tools"]
  );
  assert.equal(categories[0].title, "Cà phê hạt");
  assert.equal(categories[2].title, "Seasonal Coffee & Tools");
  assert.equal(categories[2].href, "/san-pham?category=seasonal%20coffee%20%26%20tools");
});

test("footer categories are empty when there are no active product categories", () => {
  assert.deepEqual(buildFooterCategories([]), []);
  assert.deepEqual(buildFooterCategories([{ category: " " }]), []);
});
