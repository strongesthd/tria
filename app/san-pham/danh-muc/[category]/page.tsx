import type { Metadata } from "next";
import ProductsPage from "../../page";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../../../../lib/site-data";
import { productCategoryFromSlug, productCategoryPath } from "../../../../lib/product-routes";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{ target?: string; q?: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const filters = await searchParams;
  const category = productCategoryFromSlug(categorySlug);
  const categoryData = PRODUCT_CATEGORIES.find((item) => item.id === category);
  if (!category || !categoryData) return { title: "Danh mục sản phẩm | TRIA CAFE" };
  return {
    title: `${categoryData.subtitle} - ${categoryData.title} | TRIA CAFE`,
    description: `${categoryData.description} Khám phá ${categoryData.title.toLowerCase()} tại TRIA CAFE.`,
    alternates: { canonical: `${productCategoryPath(category)}${filters.target ? `?target=${filters.target}` : ""}` },
  };
}

export default async function ProductCategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { category: categorySlug } = await params;
  const filters = await searchParams;
  const category = productCategoryFromSlug(categorySlug);
  return <ProductsPage redirectLegacy={false} searchParams={Promise.resolve({ category: category || (categorySlug as ProductCategory), ...filters })} />;
}
