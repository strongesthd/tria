"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const source = images.length ? images : ["/images/tria_logo.png"];

  function move(direction: 1 | -1) {
    setActive((current) => (current + direction + source.length) % source.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, source.length]);

  return (
    <>
      <div className="space-y-3">
        <button type="button" onClick={() => setLightboxOpen(true)} className="group relative block w-full overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412] text-left" aria-label={`Xem ảnh ${active + 1} toàn màn hình`}>
          <Image src={source[active]} alt={`${name} - ảnh ${active + 1}`} width={800} height={600} priority={active === 0} unoptimized={source[active].startsWith("data:")} sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Maximize2 className="h-3.5 w-3.5" /> Xem toàn màn hình</span>
        </button>
        {source.length > 1 && <div className="grid grid-cols-5 gap-2">{source.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Chọn ảnh ${index + 1}`} className={`overflow-hidden rounded-lg border-2 transition ${active === index ? "border-[#D97706] shadow-[0_0_0_2px_rgba(217,119,6,0.2)]" : "border-[#3A302B] hover:border-[#A85C38]"}`}><Image src={image} alt={`${name} thumbnail ${index + 1}`} width={120} height={90} unoptimized={image.startsWith("data:")} className="h-16 w-full object-cover transition duration-300 hover:scale-105" /></button>)}</div>}
      </div>

      {lightboxOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-label={`Trình chiếu ảnh ${name}`} onClick={() => setLightboxOpen(false)}>
        <button type="button" aria-label="Đóng trình chiếu" onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 p-3 text-white transition hover:border-[#E2A168] hover:bg-[#D97706]"><X className="h-6 w-6" /></button>
        <button type="button" aria-label="Ảnh trước" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 top-1/2 z-10 rounded-full border border-white/20 bg-black/45 p-3 text-white transition hover:border-[#E2A168] hover:bg-[#D97706] sm:left-8"><ChevronLeft className="h-7 w-7" /></button>
        <div className="relative flex h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
          <Image key={source[active]} src={source[active]} alt={`${name} - ảnh ${active + 1}`} width={1600} height={1200} unoptimized={source[active].startsWith("data:")} sizes="100vw" className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl animate-fade-in" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur">{active + 1} / {source.length}</div>
        </div>
        <button type="button" aria-label="Ảnh tiếp theo" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 top-1/2 z-10 rounded-full border border-white/20 bg-black/45 p-3 text-white transition hover:border-[#E2A168] hover:bg-[#D97706] sm:right-8"><ChevronRight className="h-7 w-7" /></button>
      </div>}
    </>
  );
}
