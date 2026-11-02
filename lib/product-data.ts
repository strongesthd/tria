import type { Product } from "./site-data";
import { parseProductPriceOptions } from "./product-pricing";

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
}): Product {
  return {
    ...record,
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
