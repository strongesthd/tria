import type { ProductPriceOption } from "./site-data";

const DEFAULT_WEIGHT_PRICE_DELTAS = [
  { unit: "250g", delta: 0 },
  { unit: "500g", delta: 95_000 },
  { unit: "1kg", delta: 220_000 },
] as const;

export function parseProductPriceOptions(value: unknown): ProductPriceOption[] {
  if (!Array.isArray(value) || value.length > 6) return [];

  const options: ProductPriceOption[] = [];
  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      !("unit" in item) ||
      !("price" in item) ||
      typeof item.unit !== "string" ||
      !item.unit.trim() ||
      item.unit.length > 24 ||
      typeof item.price !== "number" ||
      !Number.isSafeInteger(item.price) ||
      item.price < 1 ||
      item.price > 1_000_000_000
    ) {
      return [];
    }
    options.push({ unit: item.unit.trim(), price: item.price });
  }

  if (new Set(options.map(({ unit }) => unit.toLocaleLowerCase())).size !== options.length) return [];
  return options;
}

export function getBeanPriceOptions(
  price: number,
  configuredOptions?: unknown,
): ProductPriceOption[] {
  const parsedOptions = parseProductPriceOptions(configuredOptions);
  if (parsedOptions.length) return parsedOptions;
  return DEFAULT_WEIGHT_PRICE_DELTAS.map(({ unit, delta }) => ({ unit, price: price + delta }));
}

export function parseProductPriceOptionsInput(
  value: string,
  unit: string,
  price: number,
  category: string,
): ProductPriceOption[] | null {
  if (category !== "beans") return null;
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [{ unit, price }];
  if (lines.length > 6) throw new Error("Tối đa 6 tùy chọn giá cho mỗi sản phẩm.");

  const options = lines.map((line) => {
    const match = /^(.+?)\s*:\s*(\d+)$/.exec(line);
    if (!match) throw new Error("Mỗi tùy chọn cần nhập theo định dạng: 250g: 185000.");
    const optionUnit = match[1].trim();
    const optionPrice = Number(match[2]);
    if (!optionUnit || optionUnit.length > 24 || !Number.isSafeInteger(optionPrice) || optionPrice < 1 || optionPrice > 1_000_000_000) {
      throw new Error("Quy cách hoặc giá tùy chọn không hợp lệ.");
    }
    return { unit: optionUnit, price: optionPrice };
  });

  if (new Set(options.map(({ unit: optionUnit }) => optionUnit.toLocaleLowerCase())).size !== options.length) {
    throw new Error("Quy cách tùy chọn không được trùng nhau.");
  }
  return options;
}

export function formatProductPriceOptions(value: unknown, price: number): string {
  return getBeanPriceOptions(price, value)
    .map(({ unit, price: optionPrice }) => `${unit}: ${optionPrice}`)
    .join("\n");
}

export function getCartProductPrice(
  product: { id: string; category: string; price: number; priceOptions?: unknown },
  cartProductId: string,
): { price: number; unit: string | null } | null {
  if (cartProductId === product.id) return { price: product.price, unit: null };
  if (!cartProductId.startsWith(`${product.id}-`)) return null;

  const suffix = cartProductId.slice(product.id.length + 1);
  if (product.category !== "beans") return null;
  const option = getBeanPriceOptions(product.price, product.priceOptions)
    .sort((left, right) => right.unit.length - left.unit.length)
    .find(({ unit }) => suffix === unit || suffix.startsWith(`${unit}-`));
  return option ? { price: option.price, unit: option.unit } : null;
}
