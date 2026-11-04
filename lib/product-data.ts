import type { Product } from "./site-data";
import { parseProductPriceOptions } from "./product-pricing";
import { prisma } from "./prisma";

export type ProductReviewSummary = { rating: number; reviews: number };

export async function getProductReviewSummaries(productIds: string[]) {
  if (!productIds.length) return new Map<string, ProductReviewSummary>();
  const summaries = await prisma.productReview.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(summaries.map((summary) => [summary.productId, {
    rating: Math.round((summary._avg.rating || 0) * 10) / 10,
    reviews: summary._count._all,
  }]));
}

export function toSiteProduct(record: {
  id: string;
  slug: string;
  name: string;
  category: string;
  target: string;
  price: number;
  unit: string;
  priceOptions: unknown;
  accessoryIds: string[];
  roastLevel: string | null;
  technicalSpecs: unknown;
  notes: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
}, reviewSummary: ProductReviewSummary = { rating: 0, reviews: 0 }): Product {
  return {
    ...record,
    rating: reviewSummary.rating,
    reviews: reviewSummary.reviews,
    category: record.category as Product["category"],
    target: record.target as Product["target"],
    priceOptions: parseProductPriceOptions(record.priceOptions),
    accessoryIds: record.accessoryIds,
    technicalSpecs: typeof record.technicalSpecs === "string"
      ? record.technicalSpecs
      : record.technicalSpecs && typeof record.technicalSpecs === "object" && !Array.isArray(record.technicalSpecs)
        ? Object.entries(record.technicalSpecs as Record<string, string>)
          .map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`)
          .join("")
        : "",
  };
}
