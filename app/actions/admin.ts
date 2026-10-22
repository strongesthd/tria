"use server";

import { Prisma, Role } from "@prisma/client";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { footerLinkSchema } from "../../lib/validation";

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) throw new Error("Bạn không có quyền quản trị.");
}

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin();
  const badgeByRole: Record<Role, string> = { MEMBER: "Newbie Brewer", CAFE_OWNER: "Cafe Owner", TRIA_BARISTA: "TRIA Master Barista", TRIA_TECH: "TRIA Tech Specialist", ADMIN: "TRIA Admin" };
  return prisma.user.update({ where: { id: userId }, data: { role, badge: badgeByRole[role] } });
}

export async function moderateCommunityPost(postId: string, solved: boolean) {
  await requireAdmin();
  return prisma.communityPost.update({ where: { id: postId }, data: { solved } });
}

export async function updateProductStatus(productId: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidateTag("site-footer");
  revalidatePath("/admin");
}

export async function createProduct(data: { slug: string; name: string; category: string; target: string; price: number; unit: string; roastLevel: string; notes: string; description: string; image: string; images?: string[] }) {
  await requireAdmin();
  const slug = toSlug(data.name);
  const duplicate = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (duplicate) throw new Error("Tên sản phẩm đã tồn tại, slug bị trùng.");
  const product = await prisma.product.create({ data: { ...data, slug } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/san-pham");
  return product;
}

export async function updateProduct(productId: string, data: { slug: string; name: string; category: string; target: string; price: number; unit: string; roastLevel: string; notes: string; description: string; image: string; images?: string[] }) {
  await requireAdmin();
  const slug = toSlug(data.name);
  const duplicate = await prisma.product.findFirst({ where: { slug, NOT: { id: productId } }, select: { id: true } });
  if (duplicate) throw new Error("Tên sản phẩm đã tồn tại, slug bị trùng.");
  const product = await prisma.product.update({ where: { id: productId }, data: { ...data, slug } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/san-pham");
  return product;
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/san-pham");
}

export async function updateBranchStatus(branchId: string, active: boolean) {
  await requireAdmin();
  await prisma.branch.update({ where: { id: branchId }, data: { active } });
  revalidateTag("site-footer");
  revalidatePath("/admin");
}

export async function createBranch(data: { slug: string; name: string; address: string; hours: string; phone: string; features: string[]; image: string; images?: string[] }) {
  await requireAdmin();
  const slug = toSlug(data.name);
  const duplicate = await prisma.branch.findUnique({ where: { slug }, select: { id: true } });
  if (duplicate) throw new Error("Tên cơ sở đã tồn tại, slug bị trùng.");
  const branch = await prisma.branch.create({ data: { ...data, slug } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/he-thong-quan");
  return branch;
}

export async function updateBranch(branchId: string, data: { slug: string; name: string; address: string; hours: string; phone: string; features: string[]; image: string; images?: string[] }) {
  await requireAdmin();
  const slug = toSlug(data.name);
  const duplicate = await prisma.branch.findFirst({ where: { slug, NOT: { id: branchId } }, select: { id: true } });
  if (duplicate) throw new Error("Tên cơ sở đã tồn tại, slug bị trùng.");
  const branch = await prisma.branch.update({ where: { id: branchId }, data: { ...data, slug } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/he-thong-quan");
  return branch;
}

export async function deleteBranch(branchId: string) {
  await requireAdmin();
  await prisma.branch.delete({ where: { id: branchId } });
  revalidateTag("site-footer");
  revalidatePath("/admin"); revalidatePath("/"); revalidatePath("/he-thong-quan");
}

function parseFooterLinkInput(input: unknown) {
  const parsed = footerLinkSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Thông tin liên kết không hợp lệ.");
  return parsed.data;
}

function parseFooterLinkId(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.length > 64) {
    throw new Error("Liên kết không hợp lệ.");
  }
  return value.trim();
}

function footerLinkMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") throw new Error("Tên liên kết này đã tồn tại trong nhóm đã chọn.");
    if (error.code === "P2025") throw new Error("Không tìm thấy liên kết cần cập nhật.");
  }
  throw new Error("Không thể lưu liên kết. Vui lòng thử lại.");
}

export async function createFooterLink(input: unknown) {
  await requireAdmin();
  const data = parseFooterLinkInput(input);
  try {
    const link = await prisma.footerLink.create({ data });
    revalidateTag("site-footer");
    revalidatePath("/admin");
    return link;
  } catch (error) {
    footerLinkMutationError(error);
  }
}

export async function updateFooterLink(id: string, input: unknown) {
  await requireAdmin();
  const linkId = parseFooterLinkId(id);
  const data = parseFooterLinkInput(input);
  try {
    const link = await prisma.footerLink.update({ where: { id: linkId }, data });
    revalidateTag("site-footer");
    revalidatePath("/admin");
    return link;
  } catch (error) {
    footerLinkMutationError(error);
  }
}

export async function setFooterLinkActive(id: string, active: unknown) {
  await requireAdmin();
  const linkId = parseFooterLinkId(id);
  if (typeof active !== "boolean") throw new Error("Trạng thái liên kết không hợp lệ.");
  try {
    const link = await prisma.footerLink.update({ where: { id: linkId }, data: { active } });
    revalidateTag("site-footer");
    revalidatePath("/admin");
    return link;
  } catch (error) {
    footerLinkMutationError(error);
  }
}

export async function deleteFooterLink(id: string) {
  await requireAdmin();
  const linkId = parseFooterLinkId(id);
  try {
    await prisma.footerLink.delete({ where: { id: linkId } });
    revalidateTag("site-footer");
    revalidatePath("/admin");
  } catch (error) {
    footerLinkMutationError(error);
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin");
}

export async function updateMessageStatus(messageId: string, status: string) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin");
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await requireAdmin();
  await prisma.booking.update({ where: { id: bookingId }, data: { note: status } });
  revalidatePath("/admin");
}

export async function updateLeadStatus(leadId: string, status: string) {
  await requireAdmin();
  await prisma.partnershipLead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.id === userId) throw new Error("Không thể xóa tài khoản admin đang đăng nhập.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/admin");
}

export async function deleteMessage(messageId: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: messageId } });
  revalidatePath("/admin");
}

export async function deleteLead(leadId: string) {
  await requireAdmin();
  await prisma.partnershipLead.delete({ where: { id: leadId } });
  revalidatePath("/admin");
}
