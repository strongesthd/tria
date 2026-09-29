import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "../components/auth/AuthProvider";
import CartProvider from "../components/cart/CartProvider";
import CartDrawer from "../components/cart/CartDrawer";
import JsonLd from "../components/seo/JsonLd";
import Header from "../components/sections/Header";
import Footer from "../components/sections/Footer";
import { SITE_URL } from "../lib/site-data";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "TRIA CAFE | Cà phê Việt & Giải pháp pha chế",
      template: "%s | TRIA CAFE",
    },
    description:
      "Hệ sinh thái TRIA CAFE: hạt cà phê Việt rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức. Khám phá Fine Robusta, máy pha B2C/B2B và trải nghiệm thực tế tại TP.HCM.",
    keywords: [
      "TRIA CAFE",
      "cà phê Việt",
      "Fine Robusta",
      "máy pha espresso",
      "cà phê hạt",
      "home barista",
      "quán cà phê",
      "B2B máy pha",
      "cộng đồng cà phê",
      "workshop cà phê",
    ],
    authors: [{ name: "TRIA CAFE" }],
    creator: "TRIA CAFE",
    publisher: "TRIA CAFE",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: SITE_URL,
      siteName: "TRIA CAFE",
      title: "TRIA CAFE | Cà phê Việt & Giải pháp pha chế",
      description:
        "Hạt cà phê Việt rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức. Trải nghiệm thực tế tại 2 flagship store TP.HCM.",
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "TRIA CAFE - Hệ sinh thái cà phê Việt" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "TRIA CAFE | Cà phê Việt & Giải pháp pha chế",
      description: "Hạt cà phê Việt rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức.",
      images: ["/images/og-image.png"],
    },
    icons: { icon: "/images/tria_logo.png", apple: "/images/tria_logo.png" },
    other: { "theme-color": "#1c1613" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Compute which OAuth providers are configured on the server, then hand the
  // booleans to the client tree. Raw secrets never reach the browser.
  // NOTE: deliberately not calling auth() here. Reading cookies in the root
  // layout would force every page dynamic and kill static prerendering;
  // SessionProvider fetches the session once client-side after hydration.
  const oauthEnabled = {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
  };

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-[#1C1613] font-sans text-[#FDFBF7] antialiased">
        <AuthProvider>
          <CartProvider>
            <Header oauthEnabled={oauthEnabled} />
            <main id="main-content" tabIndex={-1} className="pt-20">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <JsonLd />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
