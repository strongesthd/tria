import { Metadata } from "next";
import { prisma } from "../lib/prisma";
import { PRODUCT_CATEGORIES, PRODUCTS, SITE_NAME, type Product } from "../lib/site-data";
import { Hero, Pillars, ProductCategoryCards, FeaturedProducts, TrustBanner } from "../components/sections/HomeSections";

export const metadata: Metadata = {
  title: "Hệ sinh thái cà phê Việt - Beans · Machines · Community",
  description: "TRIA CAFE: hạt cà phê Việt rang tươi, máy pha espresso B2C/B2B và cộng đồng tri thức. Khám phá tại TP.HCM.",
  openGraph: { title: `${SITE_NAME} | Hệ sinh thái cà phê Việt`, description: "Hạt cà phê Việt rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức." },
  alternates: { canonical: "/" },
};

async function getHomepageData(): Promise<{ products: Product[]; branchCount: number }> {
  try {
    const [dbProducts, branchCount] = await Promise.all([
      prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
      prisma.branch.count({ where: { active: true } }),
    ]);
    if (!dbProducts.length || !branchCount) return { products: PRODUCTS, branchCount: 3 };
    const products: Product[] = dbProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category as Product["category"],
      target: p.target as Product["target"],
      price: p.price,
      unit: p.unit,
      roastLevel: p.roastLevel,
      notes: p.notes,
      image: p.image,
      images: p.images,
      description: p.description,
      rating: p.rating,
      reviews: p.reviews,
    }));
    return { products, branchCount };
  } catch {
    return { products: PRODUCTS, branchCount: 3 };
  }
}

export default async function HomePage() {
  const { products, branchCount } = await getHomepageData();
  return (
    <div className="bg-[#1C1613]">
      <Hero branchCount={branchCount} />
      <Pillars />
      <ProductCategoryCards categories={PRODUCT_CATEGORIES} />
      <FeaturedProducts products={products} />
      <TrustBanner branchCount={branchCount} />
    </div>
  );
}
