import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";
import { BRANCHES, PRODUCTS, SITE_URL } from "../lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/san-pham`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/cong-dong`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/he-thong-quan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/giai-phap-b2b`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hop-tac`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = ["beans", "machines", "accessories"].map(
    (category) => ({
      url: `${SITE_URL}/san-pham?category=${category}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: new Date(),
    })
  );

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/san-pham/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const branchRoutes: MetadataRoute.Sitemap = BRANCHES.map((branch) => ({
    url: `${SITE_URL}/he-thong-quan#${branch.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let communityRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.communityPost.findMany({
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

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...branchRoutes,
    ...communityRoutes,
  ];
}
