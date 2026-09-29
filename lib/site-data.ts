/**
 * Shared site content. Single source of truth used by pages, sitemap and
 * structured data so nothing can drift between them.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const SITE_NAME = "TRIA CAFE";

export type ProductCategory = "beans" | "machines" | "accessories";
export type Target = "b2c" | "b2b";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  target: Target;
  price: number;
  unit: string;
  roastLevel: string;
  notes: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
};

const img = (id: string, width = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${width}`;

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "fine-robusta-lam-dong-premium",
    name: "TRIA Fine Robusta - Lam Dong Premium",
    category: "beans",
    target: "b2c",
    price: 185000,
    unit: "250g",
    roastLevel: "Medium Roast",
    notes: "Dark Chocolate, Ripe Berry, Caramel Finish",
    image: img("photo-1559056199-641a0ac8b55e", 600),
    description:
      "100% Robusta Chế biến Ẩm (Wet Process) từ Bảo Lộc. Thích hợp pha Espresso và Phin hiện đại.",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "p2",
    slug: "signature-blend-vietnamese-heritage",
    name: "TRIA Signature Blend - Vietnamese Heritage",
    category: "beans",
    target: "b2b",
    price: 320000,
    unit: "1Kg",
    roastLevel: "Medium-Dark",
    notes: "Nhiều Crema, Vị Đậm Đà, Hậu Vị Ngọt",
    image: img("photo-1587734195503-904fca47e0e9", 600),
    description:
      "Dòng hạt tiêu chuẩn tối ưu chi phí cho các quán Espresso & Bistro. Chiết xuất ổn định, đậm gu Việt.",
    rating: 5.0,
    reviews: 310,
  },
  {
    id: "p3",
    slug: "espresso-pro-home-barista",
    name: "TRIA Espresso Pro - Home Barista",
    category: "machines",
    target: "b2c",
    price: 8900000,
    unit: "Máy",
    roastLevel: "N/A",
    notes: "Bơm ULKA Ý 15 Bar, PID Control, Vòi Đánh Sữa Chuyên Nghiệp",
    image: img("photo-1517668808822-9ebb02f2a0e6", 600),
    description:
      "Thiết kế nhỏ gọn, khung kim loại cao cấp. Dành riêng cho trải nghiệm pha cà phê chuẩn Barista tại nhà.",
    rating: 4.8,
    reviews: 64,
  },
  {
    id: "p4",
    slug: "espresso-pro-commercial-2-group",
    name: "TRIA Espresso Pro - Commercial 2 Group",
    category: "machines",
    target: "b2b",
    price: 68000000,
    unit: "Máy",
    roastLevel: "N/A",
    notes: "Nồi hơi kép 11L, Công suất 3500W, Định lượng tự động",
    image: img("photo-1514432324607-a09d9b4aefdd", 600),
    description:
      "Dòng máy pha công nghiệp chịu tải cao cho giờ cao điểm. Tích hợp công nghệ kiểm soát nhiệt độ độ chính xác cao.",
    rating: 4.9,
    reviews: 42,
  },
  {
    id: "p5",
    slug: "barista-kit-tamper-pitcher",
    name: "TRIA Barista Kit - Tamper & Pitcher Set",
    category: "accessories",
    target: "b2c",
    price: 790000,
    unit: "Bộ",
    roastLevel: "N/A",
    notes: "Tamper 58mm, ca đánh sữa 450ml, chổi vệ sinh",
    image: img("photo-1514432324607-a09d9b4aefdd", 600),
    description:
      "Bộ dụng cụ nền tảng cho Home Barista, hoàn thiện góc pha chế tại nhà gọn gàng và chuyên nghiệp.",
    rating: 4.8,
    reviews: 37,
  },
];

export type Category = {
  id: ProductCategory;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: "beans",
    title: "TRIA Beans",
    subtitle: "Hạt cà phê rang tươi",
    description: "Fine Robusta & Arabica cho gu Việt đậm đà.",
    image: img("photo-1447933601403-0c6688de566e", 600),
  },
  {
    id: "machines",
    title: "TRIA Machines",
    subtitle: "Máy pha espresso",
    description: "Từ Home Barista đến mô hình quán chuyên nghiệp.",
    image: img("photo-1517668808822-9ebb02f2a0e6", 600),
  },
  {
    id: "accessories",
    title: "Barista Tools",
    subtitle: "Phụ kiện pha chế",
    description: "Dụng cụ chuẩn xác cho từng shot cà phê.",
    image: img("photo-1514432324607-a09d9b4aefdd", 600),
  },
];

export type Branch = {
  id: string;
  name: string;
  slug: string;
  address: string;
  hours: string;
  phone: string;
  features: string[];
  image: string;
};

export const BRANCHES: Branch[] = [
  {
    id: "loc1",
    name: "Chi nhánh Quận 1 - Flagship Experience Hub",
    slug: "flagship-quan-1",
    address: "142 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh",
    hours: "07:00 - 22:30 hàng ngày",
    phone: "028 3822 9900",
    features: [
      "Thử máy pha B2C & B2B",
      "Cupping Lab hạt Robusta",
      "Quầy pha chế thực chiến",
      "Barista Training Corner",
    ],
    image: img("photo-1554118811-1e0d58224f24", 1200),
  },
  {
    id: "loc2",
    name: "Chi nhánh Thủ Đức - Roastery & Tech Lab",
    slug: "roastery-thu-duc",
    address: "68 Đường Khổng Tử, Phường Bình Thọ, TP. Thủ Đức, TP. Hồ Chí Minh",
    hours: "07:30 - 21:30 hàng ngày",
    phone: "028 3720 1100",
    features: [
      "Trưng bày Xưởng Rang",
      "Trung tâm Bảo hành & Kỹ thuật Máy",
      "Workshop Cuối tuần",
      "Khu Demo B2B",
    ],
    image: img("photo-1501339847302-ac426a4a7cbb", 1200),
  },
];

export const HOTLINE = "1900 6868";
export const HOTLINE_MOBILE = "0901 234 567";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/san-pham", label: "Sản Phẩm", shortLabel: "Sản Phẩm" },
  { href: "/cong-dong", label: "TRIA Community", shortLabel: "Community" },
  { href: "/he-thong-quan", label: "Hệ Thống Quán", shortLabel: "Hệ Thống Quán" },
  { href: "/giai-phap-b2b", label: "Giải Pháp B2B", shortLabel: "Giải Pháp B2B" },
];

/** JSON-LD for the Organization + both physical locations. */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "CafeOrCoffeeShop"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/tria_logo.png`,
    image: `${SITE_URL}/images/tria_logo.png`,
    description:
      "Hệ sinh thái cà phê Việt: hạt cà phê rang tươi, máy pha chuyên nghiệp và cộng đồng tri thức.",
    telephone: HOTLINE,
    email: "hello@triacafe.vn",
    priceRange: "₫₫",
    currenciesAccepted: "VND",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: BRANCHES[0].address,
      addressLocality: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    sameAs: ["https://www.facebook.com/triacafe", "https://www.instagram.com/triacafe"],
    department: BRANCHES.map((branch) => ({
      "@type": "CafeOrCoffeeShop",
      "@id": `${SITE_URL}/he-thong-quan/${branch.slug}/`,
      name: branch.name,
      image: branch.image,
      telephone: branch.phone,
      openingHours: branch.hours.replace(" hàng ngày", ""),
      address: {
        "@type": "PostalAddress",
        streetAddress: branch.address,
        addressLocality: "TP. Hồ Chí Minh",
        addressCountry: "VN",
      },
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`,
    })),
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/san-pham?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/san-pham/${product.slug}/`,
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category,
    aggregateRating:
      product.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
            bestRating: 5,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/san-pham/${product.slug}/`,
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
