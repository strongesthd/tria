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
  locationId: z.enum(["loc1", "loc2", "loc3"]),
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
