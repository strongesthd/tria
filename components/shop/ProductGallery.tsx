"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  const source = images.length ? images : ["/images/tria_logo.png"];
  return <div className="space-y-3"><div className="relative overflow-hidden rounded-2xl border border-[#2A2421] bg-[#171412]"><Image src={source[active]} alt={`${name} - ảnh ${active + 1}`} width={800} height={600} priority={active === 0} unoptimized={source[active].startsWith("data:")} sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-square w-full object-cover" /></div>{source.length > 1 && <div className="grid grid-cols-5 gap-2">{source.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActive(index)} className={`overflow-hidden rounded-lg border-2 ${active === index ? "border-[#D97706]" : "border-[#3A302B]"}`}><Image src={image} alt={`${name} thumbnail ${index + 1}`} width={120} height={90} unoptimized={image.startsWith("data:")} className="h-16 w-full object-cover" /></button>)}</div>}</div>;
}
