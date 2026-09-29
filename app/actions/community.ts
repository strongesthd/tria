"use server";

import { Role } from "@prisma/client";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { rateLimit } from "../../lib/rate-limit";
import {
  createCommentSchema,
  createPostSchema,
  registerWorkshopSchema,
  voteSchema,
} from "../../lib/validation";

// ---------- helpers ----------

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  return session.user;
}

function rateOrThrow(key: string, opts: { limit: number; windowMs: number }) {
  const result = rateLimit(key, opts);
  if (!result.ok) {
    throw new Error(`Thao tác quá nhanh. Vui lòng thử lại sau ${result.retryAfterSeconds}s.`);
  }
}

// ---------- community posts ----------

export async function createCommunityPost(formData: FormData) {
  const user = await requireUser();
  rateOrThrow(`saction:create-post:${user.id}`, { limit: 3, windowMs: 10 * 60_000 });

  const parsed = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(msg);
  }

  const [post] = await prisma.$transaction([
    prisma.communityPost.create({
      data: { ...parsed.data, authorId: user.id },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { triaPoints: { increment: 10 } },
    }),
  ]);
  return post;
}

// ---------- comments ----------

export async function createComment(formData: FormData) {
  const user = await requireUser();
  rateOrThrow(`saction:comment:${user.id}`, { limit: 10, windowMs: 5 * 60_000 });

  const parsed = createCommentSchema.safeParse({
    content: formData.get("content"),
    postId: formData.get("postId"),
    parentId: formData.get("parentId"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }

  // Verify post exists and parentId (if provided) belongs to the same post.
  const post = await prisma.communityPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true },
  });
  if (!post) throw new Error("Bài viết không tồn tại.");

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, postId: true },
    });
    if (!parent || parent.postId !== parsed.data.postId) {
      throw new Error("Bình luận cha không hợp lệ.");
    }
  }

  return prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: parsed.data.postId,
      parentId: parsed.data.parentId,
      authorId: user.id,
    },
  });
}

// ---------- votes (one per user, direction flips) ----------

export async function votePost(formData: FormData) {
  const user = await requireUser();
  rateOrThrow(`saction:vote:${user.id}`, { limit: 20, windowMs: 1 * 60_000 });

  const parsed = voteSchema.safeParse({
    postId: formData.get("postId"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true },
  });
  if (!post) throw new Error("Bài viết không tồn tại.");

  const targetDirection = parsed.data.direction === "up" ? 1 : -1;

  const existing = await prisma.postVote.findUnique({
    where: { postId_userId: { postId: parsed.data.postId, userId: user.id } },
    select: { direction: true },
  });

  if (existing) {
    if (existing.direction === targetDirection) {
      // Re-vote same direction → remove the vote.
      await prisma.$transaction([
        prisma.postVote.delete({
          where: { postId_userId: { postId: parsed.data.postId, userId: user.id } },
        }),
        prisma.communityPost.update({
          where: { id: parsed.data.postId },
          data: targetDirection === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        }),
      ]);
      return { voted: false, direction: null };
    }

    // Flip vote direction.
    await prisma.$transaction([
      prisma.postVote.update({
        where: { postId_userId: { postId: parsed.data.postId, userId: user.id } },
        data: { direction: targetDirection },
      }),
      prisma.communityPost.update({
        where: { id: parsed.data.postId },
        data:
          targetDirection === 1
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
      }),
    ]);
    return { voted: true, direction: parsed.data.direction };
  }

  // New vote.
  await prisma.$transaction([
    prisma.postVote.create({
      data: { postId: parsed.data.postId, userId: user.id, direction: targetDirection },
    }),
    prisma.communityPost.update({
      where: { id: parsed.data.postId },
      data: targetDirection === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
    }),
  ]);
  return { voted: true, direction: parsed.data.direction };
}

// ---------- workshop registration ----------

export async function registerWorkshop(formData: FormData) {
  const user = await requireUser();
  rateOrThrow(`saction:workshop:${user.id}`, { limit: 2, windowMs: 10 * 60_000 });

  const parsed = registerWorkshopSchema.safeParse({ eventId: formData.get("eventId") });
  if (!parsed.success) throw new Error("Workshop không hợp lệ.");

  const workshop = await prisma.workshop.findUnique({
    where: { id: parsed.data.eventId },
    select: { id: true, capacity: true, _count: { select: { registrations: true } } },
  });
  if (!workshop) throw new Error("Workshop không tồn tại.");

  if (workshop._count.registrations >= workshop.capacity) {
    throw new Error("Workshop đã đầy. Vui lòng chọn buổi khác.");
  }

  // Upsert is safe: duplicate registration is idempotent.
  await prisma.workshopRegistration.upsert({
    where: { workshopId_userId: { workshopId: parsed.data.eventId, userId: user.id } },
    create: { workshopId: parsed.data.eventId, userId: user.id },
    update: {},
  });

  return { ok: true };
}

// ---------- moderation ----------

export async function canManageCommunity() {
  const user = await requireUser();
  const moderatorRoles: Role[] = [Role.ADMIN, Role.TRIA_BARISTA, Role.TRIA_TECH];
  return moderatorRoles.includes(user.role);
}
