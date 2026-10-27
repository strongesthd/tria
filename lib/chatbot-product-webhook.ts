import { z } from "zod";

const imageUrlSchema = z.string().max(2000).refine(
  (value) => value === "" || (/^https:\/\//i.test(value) && !/[\u0000-\u0020]/.test(value)) || (/^\/(?!\/)/.test(value) && !value.includes("\\")),
  "Ảnh sản phẩm phải là URL HTTPS hoặc đường dẫn nội bộ."
);

const priceOptionSchema = z.object({
  unit: z.string().trim().min(1).max(24),
  price: z.number().int().min(1).max(1_000_000_000),
}).strict();

export const chatbotProductSchema = z.object({
  sourceId: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(180),
  category: z.enum(["beans", "machines", "accessories"]),
  target: z.enum(["b2c", "b2b", "both"]),
  price: z.number().int().min(1).max(1_000_000_000),
  unit: z.string().trim().min(1).max(24),
  priceOptions: z.array(priceOptionSchema).max(6).default([]),
  roastLevel: z.string().trim().max(80).nullable().default(null),
  notes: z.string().trim().max(2000).default(""),
  description: z.string().trim().min(1).max(20_000),
  image: imageUrlSchema,
  images: z.array(imageUrlSchema).max(8).default([]),
  active: z.boolean().default(true),
}).strict().superRefine((product, context) => {
  const units = product.priceOptions.map(({ unit }) => unit.toLocaleLowerCase());
  if (new Set(units).size !== units.length) {
    context.addIssue({ code: "custom", path: ["priceOptions"], message: "Quy cách giá không được trùng nhau." });
  }
});
