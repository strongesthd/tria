import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create admin user
  const adminEmail = "admin@triacafe.vn";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const adminPassword = await hash("TriaDemo#2026", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "TRIA Admin",
        passwordHash: adminPassword,
        role: "ADMIN",
        badge: "TRIA Staff",
        triaPoints: 1000,
      },
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // 2. Seed Products
  const products = [
    {
      slug: "fine-robusta-lam-dong-premium",
      name: "TRIA Fine Robusta - Lam Dong Premium",
      category: "beans",
      target: "b2c",
      price: 185000,
      unit: "250g",
      roastLevel: "Medium Roast",
      notes: "Dark Chocolate, Ripe Berry, Caramel Finish",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600",
      description: "100% Robusta Chế biến Ẩm (Wet Process) từ Bảo Lộc. Thích hợp pha Espresso và Phin hiện đại.",
      rating: 4.9,
      reviews: 128,
    },
    {
      slug: "signature-blend-vietnamese-heritage",
      name: "TRIA Signature Blend - Vietnamese Heritage",
      category: "beans",
      target: "b2b",
      price: 320000,
      unit: "1Kg",
      roastLevel: "Medium-Dark",
      notes: "Nhiều Crema, Vị Đậm Đà, Hậu Vị Ngọt",
      image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&q=80&w=600",
      description: "Dòng hạt tiêu chuẩn tối ưu chi phí cho các quán Espresso & Bistro. Chiết xuất ổn định, đậm gu Việt.",
      rating: 5.0,
      reviews: 310,
    },
    {
      slug: "espresso-pro-home-barista",
      name: "TRIA Espresso Pro - Home Barista",
      category: "machines",
      target: "b2c",
      price: 8900000,
      unit: "Máy",
      roastLevel: "N/A",
      notes: "Bơm ULKA Ý 15 Bar, PID Control, Vòi Đánh Sữa Chuyên Nghiệp",
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=600",
      description: "Thiết kế nhỏ gọn, khung kim loại cao cấp. Dành riêng cho trải nghiệm pha cà phê chuẩn Barista tại nhà.",
      rating: 4.8,
      reviews: 64,
    },
    {
      slug: "espresso-pro-commercial-2-group",
      name: "TRIA Espresso Pro - Commercial 2 Group",
      category: "machines",
      target: "b2b",
      price: 68000000,
      unit: "Máy",
      roastLevel: "N/A",
      notes: "Nồi hơi kép 11L, Công suất 3500W, Định lượng tự động",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
      description: "Dòng máy pha công nghiệp chịu tải cao cho giờ cao điểm. Tích hợp công nghệ kiểm soát nhiệt độ độ chính xác cao.",
      rating: 4.9,
      reviews: 42,
    },
    {
      slug: "barista-kit-tamper-pitcher",
      name: "TRIA Barista Kit - Tamper & Pitcher Set",
      category: "accessories",
      target: "b2c",
      price: 790000,
      unit: "Bộ",
      roastLevel: "N/A",
      notes: "Tamper 58mm, ca đánh sữa 450ml, chổi vệ sinh",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
      description: "Bộ dụng cụ nền tảng cho Home Barista, hoàn thiện góc pha chế tại nhà gọn gàng và chuyên nghiệp.",
      rating: 4.8,
      reviews: 37,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  // 3. Seed Branches
  const branches = [
    {
      slug: "co-so-phu-huu",
      name: "CS1 - Phú Hữu, TP. Thủ Đức",
      address: "Số 741 Nguyễn Duy Trinh, Phường Phú Hữu, TP. Thủ Đức, TP. Hồ Chí Minh",
      hours: "08:00 - 21:30 hàng ngày",
      phone: "0989 668 113",
      features: [
        "Thử máy pha B2C & B2B",
        "Cupping Lab hạt Robusta",
        "Quầy pha chế thực chiến",
        "Barista Training Corner",
      ],
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    },
    {
      slug: "co-so-thao-dien",
      name: "CS2 - Thảo Điền, TP. Thủ Đức",
      address: "Số 32A Nguyễn Bá Huân, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
      hours: "08:00 - 21:30 hàng ngày",
      phone: "0983 020 629",
      features: [
        "Thử máy pha B2C & B2B",
        "Cupping Lab hạt Robusta",
        "Workshop Cuối tuần",
        "Khu Demo B2B",
      ],
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
    },
    {
      slug: "co-so-binh-trung-tay",
      name: "CS3 - Bình Trưng Tây, TP. Thủ Đức",
      address: "Số 342 Nguyễn Duy Trinh, Phường Bình Trưng Tây, TP. Thủ Đức, TP. Hồ Chí Minh",
      hours: "08:00 - 21:30 hàng ngày",
      phone: "0989 668 113",
      features: [
        "Trưng bày Xưởng Rang",
        "Trung tâm Bảo hành & Kỹ thuật Máy",
        "Workshop Cuối tuần",
        "Khu Demo B2B",
      ],
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: branch,
      create: branch,
    });
  }
  console.log(`✅ ${branches.length} branches seeded`);

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
