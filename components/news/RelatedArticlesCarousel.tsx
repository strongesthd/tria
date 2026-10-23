"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

type RelatedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
};

export default function RelatedArticlesCarousel({ articles }: { articles: RelatedArticle[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  }

  if (!articles.length) return null;

  return (
    <section className="mt-10" aria-labelledby="related-articles-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97706]">Đọc tiếp</p>
          <h2 id="related-articles-heading" className="mt-1 text-xl font-extrabold text-white sm:text-2xl">Bài viết liên quan</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Xem bài viết trước"
            className="rounded-full border border-[#3A302B] p-2 text-[#CDBBAA] transition-colors hover:border-[#D97706] hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Xem bài viết tiếp theo"
            className="rounded-full border border-[#3A302B] p-2 text-[#CDBBAA] transition-colors hover:border-[#D97706] hover:text-white"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:thin] [scrollbar-color:#603116_transparent]"
      >
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/tin-tuc/${article.slug}`}
            className="group w-[82%] max-w-sm shrink-0 snap-start overflow-hidden rounded-xl border border-[#2A2421] bg-[#171412] transition-colors hover:border-[#75431F] sm:w-[48%] lg:w-[32%]"
          >
            {article.image ? (
              <Image src={article.image} alt="" width={720} height={400} unoptimized className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#332A25] to-[#171412] text-[#C87D55]">
                <Newspaper className="h-9 w-9" aria-hidden />
              </div>
            )}
            <div className="p-4">
              <h3 className="line-clamp-2 font-bold leading-6 text-white group-hover:text-[#E2A168]">{article.title}</h3>
              {article.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#A69B93]">{article.excerpt}</p>}
              <span className="mt-3 inline-flex text-sm font-semibold text-[#E2A168]">Đọc bài viết <span className="ml-1" aria-hidden>→</span></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
