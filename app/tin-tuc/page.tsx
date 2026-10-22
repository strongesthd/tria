import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { prisma } from "../../lib/prisma";

export const metadata: Metadata = {
  title: "Tin tức & bài viết",
  description: "Tin tức, kiến thức và câu chuyện mới từ TRIA CAFE.",
  alternates: { canonical: "/tin-tuc" },
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [newsArticles, communityPosts] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 100,
      select: { slug: true, title: true, excerpt: true, image: true, publishedAt: true, createdAt: true },
    }),
    prisma.communityPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, title: true, content: true, image: true, createdAt: true },
    }),
  ]);
  const articles = [
    ...newsArticles.map((article) => ({
      id: `news-${article.slug}`,
      href: `/tin-tuc/${article.slug}`,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      publishedAt: article.publishedAt || article.createdAt,
    })),
    ...communityPosts.map((post) => ({
      id: `community-${post.id}`,
      href: `/cong-dong/${post.id}`,
      title: post.title,
      excerpt: post.content.slice(0, 300),
      image: post.image,
      publishedAt: post.createdAt,
    })),
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 100);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-2xl border border-[#2A2421] bg-[#171412] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[#D97706]">
          <Newspaper className="h-5 w-5" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">TRIA CAFE</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-white">Tin tức &amp; bài viết</h1>
        <p className="mt-2 text-sm text-[#A69B93]">Kiến thức, tin tức và những câu chuyện mới từ TRIA.</p>
      </header>

      {articles.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412]">
              {article.image && <Image src={article.image} alt="" width={900} height={500} unoptimized className="h-52 w-full object-cover" />}
              <div className="p-5">
                <time dateTime={article.publishedAt.toISOString()} className="text-xs text-[#81746B]">{article.publishedAt.toLocaleDateString("vi-VN")}</time>
                <h2 className="mt-2 text-lg font-bold text-white">{article.title}</h2>
                {article.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#A69B93]">{article.excerpt}</p>}
                <Link href={article.href} className="mt-4 inline-flex text-sm font-semibold text-[#E2A168] hover:underline">Đọc bài viết</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#3A302B] p-10 text-center text-sm text-[#81746B]">Chưa có bài viết được xuất bản.</p>
      )}
    </main>
  );
}
