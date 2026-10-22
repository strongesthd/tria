import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScript } from "../../../components/seo/JsonLdScript";
import { prisma } from "../../../lib/prisma";
import { SITE_URL, buildBreadcrumbJsonLd } from "../../../lib/site-data";
import { sanitizeContentHtml } from "../../../lib/sanitize-content";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { slug, published: true } });
  if (!page) return { title: "Không tìm thấy trang" };
  return {
    title: page.title,
    description: page.summary || page.content.slice(0, 160),
    alternates: { canonical: `/noi-dung/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.summary || page.content.slice(0, 160),
      url: `${SITE_URL}/noi-dung/${page.slug}`,
    },
  };
}

export default async function CmsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { slug, published: true } });
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLdScript data={buildBreadcrumbJsonLd([
        { name: "Trang chủ", href: "/" },
        { name: page.title, href: `/noi-dung/${page.slug}` },
      ])} />
      <header className="rounded-2xl border border-[#2A2421] bg-[#171412] p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-white">{page.title}</h1>
        {page.summary && <p className="mt-3 text-sm leading-6 text-[#A69B93]">{page.summary}</p>}
      </header>
      <div
        className="cms-content mt-6 whitespace-pre-wrap break-words rounded-2xl border border-[#2A2421] bg-[#171412] p-6 text-sm leading-7 text-[#E8E2D9] sm:p-8"
        dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(page.content) }}
      />
    </article>
  );
}
