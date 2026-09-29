"use server";

import { Role } from "@prisma/client";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

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
