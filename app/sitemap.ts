import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";
import { getPublicBranches } from "../lib/branch-data";
import { PRODUCTS, SITE_URL } from "../lib/site-data";
import { productCategoryPath } from "../lib/product-routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/san-pham`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/cong-dong`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/tin-tuc`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/he-thong-quan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/giai-phap-b2b`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hop-tac`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = ["beans", "machines", "accessories"].map(
    (category) => ({
      url: `${SITE_URL}${productCategoryPath(category as "beans" | "machines" | "accessories")}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: new Date(),
    })
  );

  const productLastModifiedBySlug = new Map(PRODUCTS.map((product) => [product.slug, new Date()]));
  try {
    const databaseProducts = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    for (const product of databaseProducts) productLastModifiedBySlug.set(product.slug, product.updatedAt);
  } catch {
    // Keep static products in the sitemap when the database is unavailable.
  }
  const productRoutes: MetadataRoute.Sitemap = [...productLastModifiedBySlug].map(([slug, lastModified]) => ({
    url: `${SITE_URL}/san-pham/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const branches = await getPublicBranches();
  const branchRoutes: MetadataRoute.Sitemap = branches.map((branch) => ({
    url: `${SITE_URL}/he-thong-quan#${branch.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let communityRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.communityPost.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
      take: 200,
      orderBy: { updatedAt: "desc" },
    });
    communityRoutes = posts.map((post) => ({
      url: `${SITE_URL}/cong-dong/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    // DB may not be reachable at build/sitemap time; static routes still work.
  }

  let cmsRoutes: MetadataRoute.Sitemap = [];
  try {
    const [pages, articles] = await Promise.all([
      prisma.cmsPage.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.newsArticle.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
    ]);
    cmsRoutes = [
      ...pages.map((page) => ({
        url: `${SITE_URL}/noi-dung/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...articles.map((article) => ({
        url: `${SITE_URL}/tin-tuc/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    // The static and legacy routes remain available when the database is offline.
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...branchRoutes,
    ...communityRoutes,
    ...cmsRoutes,
  ];
}
