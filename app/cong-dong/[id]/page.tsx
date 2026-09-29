import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle, ThumbsUp, Eye, Tag, Home } from "lucide-react";
import { JsonLdScript } from "../../../components/seo/JsonLdScript";
import { prisma } from "../../../lib/prisma";
import { SITE_URL, buildBreadcrumbJsonLd } from "../../../lib/site-data";
import { CATEGORY_LABELS, badgeFor, relativeTime } from "../../../components/community/types";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.communityPost.findUnique({ where: { id } }).catch(() => null);
  if (!post) return { title: "Không tìm thấy bài viết" };
  const excerpt = post.content.slice(0, 160).trim();
  return {
    title: post.title,
    description: excerpt + (post.content.length > 160 ? "…" : ""),
    keywords: post.tags,
    alternates: { canonical: `/cong-dong/${post.id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: excerpt,
      url: `${SITE_URL}/cong-dong/${post.id}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(post.tags.length ? { tags: post.tags } : {}),
    },
  };
}

export default async function PostDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const post = await prisma.communityPost
    .findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, badge: true, role: true } },
        comments: {
          where: { parentId: null },
          include: { author: { select: { name: true, image: true, badge: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    .catch(() => null);

  if (!post) notFound();

  const badge = badgeFor(post.author.badge);
  const authorName = post.author.name || "Thành viên TRIA";
  const categoryLabel =
    CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || "Thảo luận";

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          buildBreadcrumbJsonLd([
            { name: "Trang chủ", href: "/" },
            { name: "Cộng đồng", href: "/cong-dong" },
            { name: post.title, href: `/cong-dong/${post.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.content.slice(0, 200),
            datePublished: post.createdAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: authorName },
            publisher: { "@type": "Organization", name: "TRIA CAFE" },
            mainEntityOfPage: `${SITE_URL}/cong-dong/${post.id}`,
          },
        ]}
      />

      <Link href="/cong-dong" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E2A168] hover:underline">
        <Home className="h-3.5 w-3.5" aria-hidden /> Về cộng đồng TRIA
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#D97706]/15 px-3 py-1 text-xs font-bold text-[#F0B429]">{categoryLabel}</span>
        {post.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 text-xs text-[#D97706]">
            <Tag className="h-3 w-3" aria-hidden /> {tag}
          </span>
        ))}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">{post.title}</h1>

      <div className="mt-6 flex items-center gap-3 border-b border-[#2A2421] pb-6">
        {post.author.image ? (
          <Image src={post.author.image} alt={authorName} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-[#221D1A] text-sm font-bold text-[#E2A168]">
            {authorName.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-sm font-bold text-white">
            {authorName} <span className={`ml-2 text-xs font-normal ${badge.tone}`}>{badge.icon} {badge.label}</span>
          </p>
          <p className="text-xs text-[#A69B93]">{relativeTime(post.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-[#A69B93]">
          <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" aria-hidden /> {post.upvotes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" aria-hidden /> {post.comments.length}</span>
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" aria-hidden /> {post.views.toLocaleString("vi-VN")}</span>
        </div>
      </div>

      <div className="prose prose-invert mt-8 max-w-none space-y-4 text-base leading-7 text-[#D8CDC2]">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      <section className="mt-10 border-t border-[#2A2421] pt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="flex items-center gap-2 text-lg font-bold text-white">
          <MessageCircle className="h-5 w-5 text-[#D97706]" aria-hidden />
          Bình luận &amp; giải pháp ({post.comments.length})
        </h2>
        <div className="mt-5 space-y-4">
          {post.comments.length ? (
            post.comments.map((comment) => {
              const commentBadge = badgeFor(comment.author.badge);
              const commentName = comment.author.name || "Thành viên TRIA";
              return (
                <div key={comment.id} className="flex gap-3 rounded-xl bg-[#221D1A] p-4">
                  {comment.author.image ? (
                    <Image src={comment.author.image} alt={commentName} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171412] text-xs font-bold text-[#E2A168]">
                      {commentName.charAt(0)}
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{commentName}</span>
                      <span className={`text-xs ${commentBadge.tone}`}>{commentBadge.icon} {commentBadge.label}</span>
                      {comment.accepted && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">Giải pháp chuẩn</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#CDBBAA]">{comment.content}</p>
                    <p className="mt-2 text-[11px] text-[#81746B]">{relativeTime(comment.createdAt)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-dashed border-[#4A3B31] p-6 text-center text-sm text-[#A69B93]">
              Chưa có bình luận nào. Hãy chia sẻ kinh nghiệm của bạn!
            </p>
          )}
        </div>
      </section>
    </article>
  );
}