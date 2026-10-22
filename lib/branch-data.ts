import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { BRANCHES, type Branch } from "./site-data";

export type PublicBranch = Branch & { images: string[] };

async function queryPublicBranches(): Promise<PublicBranch[]> {
  try {
    return await prisma.branch.findMany({
      where: { active: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        hours: true,
        phone: true,
        features: true,
        image: true,
        images: true,
      },
    });
  } catch {
    console.error("[branch-data] Could not load branches from the database; using static branch data.");
    return BRANCHES.map((branch) => ({ ...branch, images: [] }));
  }
}

const getCachedPublicBranches = unstable_cache(queryPublicBranches, ["tria-public-branches-v1"], {
  revalidate: 300,
  tags: ["site-footer"],
});

export async function getPublicBranches() {
  try {
    return await getCachedPublicBranches();
  } catch {
    console.error("[branch-data] Cached branch data is unavailable; using static branch data.");
    return BRANCHES.map((branch) => ({ ...branch, images: [] }));
  }
}
