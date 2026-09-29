import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TRIA CAFE - Cà phê Việt & Giải pháp pha chế",
    short_name: "TRIA CAFE",
    description:
      "Hệ sinh thái cà phê Việt: hạt cà phê rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1613",
    theme_color: "#d97706",
    lang: "vi",
    icons: [
      { src: "/images/tria_logo.png", sizes: "192x192", type: "image/png" },
      { src: "/images/tria_logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}