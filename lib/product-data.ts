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
  roastLevel: string | null;
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
  };
}
