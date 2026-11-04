import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

type Activity = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  actor: string;
  createdAt: Date;
  tab: string;
};

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const checkedAt = new Date();
  const sinceParam = new URL(request.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;
  if (sinceParam && (!since || Number.isNaN(since.getTime()))) {
    return NextResponse.json({ error: "Invalid since timestamp." }, { status: 400 });
  }
  const take = since ? 100 : 12;
  const createdWhere = since ? { createdAt: { gt: since } } : {};
  const updatedReviewWhere = since ? { updatedAt: { gt: since } } : {};

  const [orders, productReviews, productComments, posts, communityComments, bookings, messages, leads, users, registrations, votes] = await Promise.all([
    prisma.order.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, total: true, name: true, createdAt: true } }),
    prisma.productReview.findMany({ where: updatedReviewWhere, orderBy: { updatedAt: "desc" }, take, select: { id: true, rating: true, content: true, createdAt: true, updatedAt: true, author: { select: { name: true, email: true } }, product: { select: { name: true } } } }),
    prisma.productComment.findMany({ where: { ...createdWhere, parentId: null, author: { is: { role: { not: Role.ADMIN } } } }, orderBy: { createdAt: "desc" }, take, select: { id: true, content: true, createdAt: true, author: { select: { name: true, email: true } }, product: { select: { name: true } } } }),
    prisma.communityPost.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, title: true, createdAt: true, author: { select: { name: true, email: true } } } }),
    prisma.comment.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, content: true, createdAt: true, author: { select: { name: true, email: true } }, post: { select: { title: true } } } }),
    prisma.booking.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, type: true, locationId: true, createdAt: true, user: { select: { name: true, email: true } } } }),
    prisma.contactMessage.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, subject: true, createdAt: true } }),
    prisma.partnershipLead.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, fullName: true, partnershipType: true, createdAt: true } }),
    prisma.user.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.workshopRegistration.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { workshopId: true, userId: true, createdAt: true, user: { select: { name: true, email: true } }, workshop: { select: { title: true } } } }),
    prisma.postVote.findMany({ where: createdWhere, orderBy: { createdAt: "desc" }, take, select: { postId: true, userId: true, direction: true, createdAt: true, user: { select: { name: true, email: true } }, post: { select: { title: true } } } }),
  ]);

  const activities: Activity[] = [
    ...orders.map((order) => ({ id: `order:${order.id}`, kind: "order", title: "Đơn hàng mới", detail: `${order.name} · ${order.total.toLocaleString("vi-VN")} VNĐ`, actor: order.name, createdAt: order.createdAt, tab: "orders" })),
    ...productReviews.map((review) => ({ id: `review:${review.id}:${review.updatedAt.getTime()}`, kind: "review", title: "Đánh giá sản phẩm", detail: `${review.product.name} · ${review.rating}/5 sao · ${review.content}`, actor: review.author.name || review.author.email || "Thành viên", createdAt: review.updatedAt, tab: "productReviews" })),
    ...productComments.map((comment) => ({ id: `product-comment:${comment.id}`, kind: "productComment", title: "Bình luận sản phẩm", detail: `${comment.product.name} · ${comment.content}`, actor: comment.author.name || comment.author.email || "Thành viên", createdAt: comment.createdAt, tab: "productComments" })),
    ...posts.map((post) => ({ id: `post:${post.id}`, kind: "post", title: "Bài viết cộng đồng mới", detail: post.title, actor: post.author.name || post.author.email || "Thành viên", createdAt: post.createdAt, tab: "content" })),
    ...communityComments.map((comment) => ({ id: `community-comment:${comment.id}`, kind: "communityComment", title: "Bình luận cộng đồng mới", detail: `${comment.post.title} · ${comment.content}`, actor: comment.author.name || comment.author.email || "Thành viên", createdAt: comment.createdAt, tab: "content" })),
    ...bookings.map((booking) => ({ id: `booking:${booking.id}`, kind: "booking", title: "Lịch demo mới", detail: `${booking.type} · ${booking.locationId}`, actor: booking.user.name || booking.user.email || "Thành viên", createdAt: booking.createdAt, tab: "bookings" })),
    ...messages.map((message) => ({ id: `message:${message.id}`, kind: "message", title: "Tin nhắn liên hệ mới", detail: message.subject || "Khách hàng gửi lời nhắn", actor: message.name, createdAt: message.createdAt, tab: "messages" })),
    ...leads.map((lead) => ({ id: `lead:${lead.id}`, kind: "lead", title: "Lead hợp tác mới", detail: lead.partnershipType, actor: lead.fullName, createdAt: lead.createdAt, tab: "points" })),
    ...users.map((user) => ({ id: `user:${user.id}`, kind: "user", title: "Tài khoản mới", detail: user.email || "", actor: user.name || user.email || "Thành viên", createdAt: user.createdAt, tab: "users" })),
    ...registrations.map((registration) => ({ id: `registration:${registration.workshopId}:${registration.userId}`, kind: "registration", title: "Đăng ký workshop mới", detail: registration.workshop.title, actor: registration.user.name || registration.user.email || "Thành viên", createdAt: registration.createdAt, tab: "bookings" })),
    ...votes.map((vote) => ({ id: `vote:${vote.postId}:${vote.userId}`, kind: "vote", title: vote.direction > 0 ? "Upvote cộng đồng mới" : "Downvote cộng đồng mới", detail: vote.post.title, actor: vote.user.name || vote.user.email || "Thành viên", createdAt: vote.createdAt, tab: "content" })),
  ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, since ? 250 : 100);

  return NextResponse.json({ activities, checkedAt: checkedAt.toISOString() }, { headers: { "Cache-Control": "no-store" } });
}