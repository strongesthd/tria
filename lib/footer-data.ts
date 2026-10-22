import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { buildFooterCategories } from "./footer-data-utils";

export type FooterData = {
  available: boolean;
  branches: { id: string; name: string; address: string; hours: string; image: string }[];
  categories: ReturnType<typeof buildFooterCategories>;
  articles: { id: string; title: string }[];
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
    const [branches, products, articles, policyLinks, supportLinks] = await Promise.all([
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
      prisma.communityPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, title: true },
      }),
      prisma.footerLink.findMany({
        where: { section: "POLICY", active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 8,
        select: { id: true, label: true, href: true },
      }),
      prisma.footerLink.findMany({
        where: { section: "SUPPORT", active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 8,
        select: { id: true, label: true, href: true },
      }),
    ]);

    return {
      available: true,
      branches,
      categories: buildFooterCategories(products),
      articles,
      policyLinks,
      supportLinks,
    };
  } catch {
    console.error("[footer-data] Could not load public footer content.");
    return emptyFooterData;
  }
}

const getCachedFooterData = unstable_cache(queryFooterData, ["tria-footer-data-v1"], {
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
