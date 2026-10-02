"use server";

import { Role } from "@prisma/client";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

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
  revalidatePath("/admin");
}

export async function updateBranchStatus(branchId: string, active: boolean) {
  await requireAdmin();
  await prisma.branch.update({ where: { id: branchId }, data: { active } });
  revalidatePath("/admin");
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

export async function updateLeadStatus(leadId: string, status: string) {
  await requireAdmin();
  await prisma.partnershipLead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
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
