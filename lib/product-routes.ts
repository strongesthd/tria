import type { ProductCategory } from "./site-data";

export const PRODUCT_CATEGORY_SLUGS: Record<ProductCategory, string> = {
  beans: "ca-phe-hat",
  machines: "may-pha-ca-phe",
  accessories: "phu-kien-barista",
};

export function productCategoryPath(category: ProductCategory) {
  return `/san-pham/danh-muc/${PRODUCT_CATEGORY_SLUGS[category]}`;
}

export function productCategoryFromSlug(slug: string): ProductCategory | null {
  return (Object.entries(PRODUCT_CATEGORY_SLUGS).find(([, categorySlug]) => categorySlug === slug)?.[0] as ProductCategory | undefined) || null;
}
