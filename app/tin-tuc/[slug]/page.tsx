import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdScript } from "../../../components/seo/JsonLdScript";
import { prisma } from "../../../lib/prisma";
import { SITE_URL, buildBreadcrumbJsonLd } from "../../../lib/site-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { slug, published: true } });
  if (!article) return { title: "Không tìm thấy bài viết" };
  const description = article.excerpt || article.content.slice(0, 160);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/tin-tuc/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${SITE_URL}/tin-tuc/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      ...(article.image ? { images: [article.image] } : {}),
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { slug, published: true } });
  if (!article) notFound();
  const author = { "@type": "Organization", name: "TRIA CAFE" };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLdScript data={[
        buildBreadcrumbJsonLd([
          { name: "Trang chủ", href: "/" },
          { name: "Tin tức & bài viết", href: "/tin-tuc" },
          { name: article.title, href: `/tin-tuc/${article.slug}` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt || article.content.slice(0, 200),
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author,
          publisher: author,
          mainEntityOfPage: `${SITE_URL}/tin-tuc/${article.slug}`,
          ...(article.image ? { image: article.image } : {}),
        },
      ]} />
      <Link href="/tin-tuc" className="text-sm font-semibold text-[#E2A168] hover:underline">← Tất cả bài viết</Link>
      <header className="mt-5 rounded-2xl border border-[#2A2421] bg-[#171412] p-6 sm:p-8">
        {article.publishedAt && <time dateTime={article.publishedAt.toISOString()} className="text-xs text-[#81746B]">{article.publishedAt.toLocaleDateString("vi-VN")}</time>}
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl">{article.title}</h1>
        {article.excerpt && <p className="mt-4 text-base leading-7 text-[#A69B93]">{article.excerpt}</p>}
      </header>
      {article.image && <Image src={article.image} alt="" width={1200} height={675} unoptimized className="mt-6 max-h-[32rem] w-full rounded-2xl object-cover" />}
      <div className="mt-6 whitespace-pre-wrap break-words rounded-2xl border border-[#2A2421] bg-[#171412] p-6 text-sm leading-7 text-[#E8E2D9] sm:p-8">
        {article.content}
      </div>
    </article>
  );
}
