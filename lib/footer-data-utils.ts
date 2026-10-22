export type ProductCategoryRow = { category: string };
export type FooterCategory = { id: string; title: string; href: string };

const CATEGORY_TITLES: Record<string, string> = {
  beans: "Cà phê hạt",
  machines: "Máy pha cà phê",
  accessories: "Phụ kiện pha chế",
  other: "Sản phẩm khác",
};

function categoryTitle(category: string) {
  if (CATEGORY_TITLES[category]) return CATEGORY_TITLES[category];
  return category
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("vi-VN"));
}

export function buildFooterCategories(rows: readonly ProductCategoryRow[]): FooterCategory[] {
  return [...new Set(rows.map(({ category }) => category.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "vi"))
    .map((category) => ({
      id: category,
      title: categoryTitle(category),
      href: `/san-pham?category=${encodeURIComponent(category)}`,
    }));
}
