import { Metadata } from "next";
import { SITE_NAME } from "../lib/site-data";
import { Hero, Pillars, ProductCategoryCards, FeaturedProducts, TrustBanner } from "../components/sections/HomeSections";

export const metadata: Metadata = {
  title: "Hệ sinh thái cà phê Việt - Beans · Machines · Community",
  description:
    "TRIA CAFE: hạt cà phê Việt rang tươi, máy pha espresso B2C/B2B và cộng đồng tri thức. Khám phá tại 2 flagship store TP.HCM.",
  openGraph: {
    title: `${SITE_NAME} | Hệ sinh thái cà phê Việt`,
    description:
      "Hạt cà phê Việt rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức. Trải nghiệm tại 2 flagship store TP.HCM.",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="bg-[#1C1613]">
      <Hero />
      <Pillars />
      <ProductCategoryCards />
      <FeaturedProducts />
      <TrustBanner />
    </div>
  );
}
