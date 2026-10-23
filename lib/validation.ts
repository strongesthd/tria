import z from "zod";

export const POST_CATEGORIES = [
  "home-barista",
  "machine-tech",
  "cafe-owner",
  "tria-lab",
  "events",
] as const;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Email không hợp lệ.");

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
  .max(128, "Mật khẩu quá dài.");

export const nameSchema = z.string().trim().min(1, "Vui lòng nhập họ tên.").max(120);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\s().-]{8,20}$/, "Số điện thoại không hợp lệ.");

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(140);

export const tagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(8, "Tối đa 8 tag cho mỗi bài viết.");

export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề quá ngắn.").max(180),
  content: z.string().trim().min(1, "Nội dung không được để trống.").max(20000),
  category: z.enum(POST_CATEGORIES).default("home-barista"),
  tags: tagsSchema.default([]),
  image: z.string().max(7_000_000, "Ảnh không được vượt quá 5MB.").optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Bình luận không được để trống.").max(5000),
  postId: z.string().trim().min(1).max(64),
  parentId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((value) => (value ? value : null)),
  image: z.string().max(7_000_000, "Ảnh không được vượt quá 5MB.").optional().nullable(),
});

export const voteSchema = z.object({
  postId: z.string().trim().min(1).max(64),
  direction: z.enum(["up", "down"]).default("up"),
});

export const registerWorkshopSchema = z.object({
  eventId: z.string().trim().min(1).max(64),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  accountType: z.enum(["personal", "business"]).default("personal"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(128),
});

export const profileSchema = z.object({
  name: nameSchema,
  avatarUrl: z.union([z.url("Đường dẫn ảnh không hợp lệ."), z.literal("")]).optional(),
});

export const bookingSchema = z.object({
  locationId: z.string().trim().min(1, "Vui lòng chọn chi nhánh.").max(140),
  bookingType: z.enum(["b2b_demo", "b2c_demo", "cupping"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
  name: nameSchema,
  phone: phoneSchema,
  note: z.string().trim().max(1000).optional(),
});

export const checkoutSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  address: z.string().trim().min(5, "Địa chỉ quá ngắn.").max(500),
  items: z.array(z.object({ id: z.string().min(1).max(180), quantity: z.number().int().min(1).max(99) })).min(1),
});

export const partnershipLeadSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  partnershipType: z.enum(["location", "franchise"]),
  location: z.string().trim().min(3, "Vui lòng nhập địa chỉ hoặc thành phố.").max(300),
  notes: z.string().trim().max(2000).optional(),
});

export const footerLinkSchema = z.object({
  section: z.enum(["POLICY", "SUPPORT"]),
  label: z.string().trim().min(2, "Tên liên kết quá ngắn.").max(80, "Tên liên kết quá dài."),
  href: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập đường dẫn nội bộ.")
    .max(300, "Đường dẫn quá dài.")
    .refine(
      (value) =>
        /^\/(?!\/)/.test(value) &&
        !value.includes("\\") &&
        !/[\u0000-\u001f\u007f]/.test(value),
      "Chỉ chấp nhận đường dẫn nội bộ của website."
    ),
  sortOrder: z.number().int().min(0).max(9999),
});

const cmsImageSchema = z
  .string()
  .max(7_000_000, "Ảnh không được vượt quá 5MB.")
  .refine(
    (value) => !value.startsWith("data:") || /^data:image\/(jpeg|png|webp|gif);base64,/.test(value),
    "Định dạng ảnh không hợp lệ."
  )
  .optional()
  .nullable();

const cmsSlugSchema = z
  .string()
  .trim()
  .min(1, "Đường dẫn không được để trống.")
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang.");

export const cmsPageContentSchema = z.object({
  title: z.string().trim().min(2, "Tiêu đề quá ngắn.").max(160),
  summary: z.string().trim().max(300, "Mô tả ngắn quá dài."),
  content: z.string().trim().min(1, "Nội dung không được để trống.").max(50_000),
}).strict();

export const cmsPageFooterSettingsSchema = z.object({
  slug: cmsSlugSchema,
  footerSection: z.enum(["POLICY", "SUPPORT"]).nullable(),
  sortOrder: z.number().int().min(0).max(9999),
  published: z.boolean(),
}).strict();

export const newsArticleSeoFieldsSchema = z.object({
  seoTitle: z.string().trim().min(1, "Vui lòng nhập tiêu đề SEO.").max(180, "Tiêu đề SEO quá dài."),
  metaDescription: z.string().trim().min(1, "Vui lòng nhập thẻ Description.").max(300, "Thẻ Description quá dài."),
  focusKeyword: z.string().trim().min(1, "Vui lòng nhập từ khóa chính.").max(100, "Từ khóa chính quá dài."),
  secondaryKeywords: z.string().trim().min(1, "Vui lòng nhập từ khóa phụ.").max(300, "Từ khóa phụ quá dài."),
});

export const newsArticleSchema = z.object({
  title: z.string().trim().min(2, "Tiêu đề quá ngắn.").max(180),
  slug: cmsSlugSchema,
  excerpt: z.string().trim().max(300, "Mô tả ngắn quá dài."),
  seoTitle: z.string().trim().max(180, "Tiêu đề SEO quá dài.").default(""),
  metaDescription: z.string().trim().max(300, "Thẻ Description quá dài.").default(""),
  focusKeyword: z.string().trim().max(100, "Từ khóa chính quá dài.").default(""),
  secondaryKeywords: z.string().trim().max(300, "Từ khóa phụ quá dài.").default(""),
  content: z.string().trim().min(1, "Nội dung không được để trống.").max(100_000),
  image: cmsImageSchema,
  published: z.boolean(),
}).superRefine((article, context) => {
  if (!article.published) return;
  const seo = newsArticleSeoFieldsSchema.safeParse(article);
  if (!seo.success) {
    for (const issue of seo.error.issues) {
      context.addIssue({ code: "custom", path: issue.path, message: issue.message });
    }
  }
});

/** Turns a ZodError into a flat `field -> message` map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
