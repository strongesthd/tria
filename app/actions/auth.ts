"use server";

import { headers } from "next/headers";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { auth, signIn, signOut } from "../../auth";
import { prisma } from "../../lib/prisma";
import { rateLimit } from "../../lib/rate-limit";
import { loginSchema, profileSchema, registerSchema } from "../../lib/validation";

export type AuthActionState = { error?: string; success?: string };

/** Real client IP from the incoming request headers. */
async function callerIp() {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return store.get("x-real-ip")?.trim() || "unknown";
}

/** Throws unless the caller owns `userId`. Prevents cross-account profile writes. */
async function assertOwner(userId: string) {
  const session = await auth();
  const callerId = session?.user?.id;
  if (!callerId) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  if (callerId !== userId) {
    throw new Error("Bạn không thể thao tác với hồ sơ của người khác.");
  }
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limit = rateLimit(`auth:register:${await callerIp()}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return { error: `Quá nhiều yêu cầu đăng ký. Vui lòng đợi ${limit.retryAfterSeconds} giây.` };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email này đã được đăng ký." };

  const role = parsed.data.accountType === "business" ? Role.CAFE_OWNER : Role.MEMBER;

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
      role,
      badge: role === Role.CAFE_OWNER ? "Cafe Owner" : "Newbie Brewer",
    },
  });

  return { success: "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay." };
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await callerIp();
  const limit = rateLimit(`auth:login:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limit.ok) {
    return { error: `Quá nhiều lần thử. Vui lòng đợi ${limit.retryAfterSeconds} giây.` };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: "Đăng nhập thành công." };
  } catch {
    return { error: "Email hoặc mật khẩu không đúng." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfileAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const userId = String(formData.get("userId") || "").trim();
  if (!userId) return { error: "Thiếu thông tin hồ sơ." };

  // Authorization first: a caller may only update their own profile.
  await assertOwner(userId);

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: String(formData.get("avatarUrl") || "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, image: parsed.data.avatarUrl || undefined },
  });
  return { success: "Đã cập nhật hồ sơ." };
}
