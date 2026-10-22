import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { buildFooterCategories } from "./footer-data-utils";

export type FooterData = {
  available: boolean;
  branches: { id: string; name: string; address: string; hours: string; image: string }[];
  categories: ReturnType<typeof buildFooterCategories>;
  articles: { id: string; title: string; href: string }[];
  policyLinks: { id: string; label: string; href: string }[];
  supportLinks: { id: string; label: string; href: string }[];
};

const emptyFooterData: FooterData = {
  available: false,
  branches: [],
  categories: [],
  articles: [],
  policyLinks: [],
  supportLinks: [],
};

async function queryFooterData(): Promise<FooterData> {
  try {
    const [branches, products, articles, cmsPages, policyLinks, supportLinks] = await Promise.all([
      prisma.branch.findMany({
        where: { active: true },
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        take: 5,
        select: { id: true, name: true, address: true, hours: true, image: true },
      }),
      prisma.product.findMany({
        where: { active: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
        take: 12,
        select: { category: true },
      }),
      Promise.all([
        prisma.newsArticle.findMany({
          where: { published: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 4,
          select: { id: true, slug: true, title: true, publishedAt: true, createdAt: true },
        }),
        prisma.communityPost.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: { id: true, title: true, createdAt: true },
        }),
      ]),
      prisma.cmsPage.findMany({
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
        take: 500,
        select: { id: true, title: true, slug: true, sortOrder: true, footerSection: true, published: true },
      }),
      prisma.footerLink.findMany({
        where: { section: "POLICY", active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 8,
        select: { id: true, label: true, href: true, sortOrder: true },
      }),
      prisma.footerLink.findMany({
        where: { section: "SUPPORT", active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 8,
        select: { id: true, label: true, href: true, sortOrder: true },
      }),
    ]);

    const [newsArticles, communityPosts] = articles;
    const latestArticles = [
      ...newsArticles.map((article) => ({
        id: `news-${article.id}`,
        title: article.title,
        href: `/tin-tuc/${article.slug}`,
        createdAt: article.publishedAt || article.createdAt,
      })),
      ...communityPosts.map((post) => ({
        id: `community-${post.id}`,
        title: post.title,
        href: `/cong-dong/${post.id}`,
        createdAt: post.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4);

    const pageLinks = (pages: { id: string; title: string; slug: string; sortOrder: number }[]) =>
      pages.map((page) => ({ id: `page-${page.id}`, label: page.title, href: `/noi-dung/${page.slug}`, sortOrder: page.sortOrder }));
    const policyPageLinks = pageLinks(cmsPages.filter((page) => page.published && page.footerSection === "POLICY"));
    const supportPageLinks = pageLinks(cmsPages.filter((page) => page.published && page.footerSection === "SUPPORT"));
    const cmsPageHrefs = new Set(cmsPages.map((page) => `/noi-dung/${page.slug}`));

    return {
      available: true,
      branches,
      categories: buildFooterCategories(products),
      articles: latestArticles,
      policyLinks: [...policyPageLinks, ...policyLinks.filter((link) => !cmsPageHrefs.has(link.href))]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 8),
      supportLinks: [...supportPageLinks, ...supportLinks.filter((link) => !cmsPageHrefs.has(link.href))]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 8),
    };
  } catch {
    console.error("[footer-data] Could not load public footer content.");
    return emptyFooterData;
  }
}

const getCachedFooterData = unstable_cache(queryFooterData, ["tria-footer-data-v2"], {
  revalidate: 300,
  tags: ["site-footer"],
});

export async function getFooterData(): Promise<FooterData> {
  try {
    return await getCachedFooterData();
  } catch {
    console.error("[footer-data] Cached footer content is unavailable.");
    return emptyFooterData;
  }
}
