import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "TriaDemo#2026";

async function main() {
  console.log("Seeding TRIA CAFE demo data...");

  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@triacafe.vn" },
    update: { role: Role.ADMIN, badge: "TRIA Admin" },
    create: {
      email: "admin@triacafe.vn",
      name: "TRIA Admin",
      passwordHash,
      role: Role.ADMIN,
      badge: "TRIA Admin",
      triaPoints: 500,
    },
  });

  const barista = await prisma.user.upsert({
    where: { email: "hoang.barista@triacafe.vn" },
    update: {},
    create: {
      email: "hoang.barista@triacafe.vn",
      name: "Hoàng Barista",
      passwordHash,
      role: Role.TRIA_BARISTA,
      badge: "TRIA Master Barista",
      triaPoints: 1280,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "minh.duc@triacafe.vn" },
    update: {},
    create: {
      email: "minh.duc@triacafe.vn",
      name: "Minh Đức",
      passwordHash,
      role: Role.CAFE_OWNER,
      badge: "Cafe Owner",
      triaPoints: 980,
    },
  });

  const posts = [
    {
      title: "Cách căn chỉnh độ mịn hạt Robusta Cầu Đất cho máy pha Espresso 1 Group không bị chua",
      content:
        "Với Fine Robusta mật độ cao, mình bắt đầu ở 18g dose, yield 40g trong 27-30 giây. Nếu shot chua và dòng chảy nhanh, giảm cỡ xay từng nấc nhỏ trước khi tăng nhiệt. Hãy ghi lại mỗi thay đổi để tìm đúng điểm cân bằng.",
      category: "home-barista",
      tags: ["#DialIn", "#FineRobusta"],
      authorId: barista.id,
      upvotes: 128,
      views: 1830,
    },
    {
      title: "[Bắt bệnh] Máy pha bị tụt áp suất giữa chừng và tiếng bơm kêu to",
      content:
        "Hãy tắt máy, xả áp và kiểm tra lần lượt nguồn nước, van cấp, lưới lọc và bơm. Không tự tháo nồi hơi khi máy còn nóng. Nếu tiếng bơm vẫn lớn sau khi mồi nước, gửi video và mã máy để kỹ thuật viên TRIA hỗ trợ.",
      category: "machine-tech",
      tags: ["#GiaiCuuBarista", "#SuaMay"],
      authorId: barista.id,
      upvotes: 96,
      views: 2410,
    },
    {
      title: "Bài toán Cost 1 ly Latte cho quán cà phê diện tích 30m2 tại Quận 1",
      content:
        "Với 18g cà phê, 180ml sữa và bao bì, tổng cost nguyên liệu của một ly Latte là khoảng 11.800đ. Điều quan trọng là cố định recipe, cân định lượng mỗi ca và theo dõi hao hụt sữa.",
      category: "cafe-owner",
      tags: ["#CostLy", "#VanHanhQuan"],
      authorId: owner.id,
      upvotes: 112,
      views: 3270,
    },
    {
      title: "Cupping Notes: TRIA Signature Blend và hậu vị caramel của vụ mới",
      content:
        "Mẻ blend lần này có body dày và crema ổn định. Ở espresso, note chocolate nổi bật; pour-over cho hậu vị caramel rõ hơn. Đây là lựa chọn tốt cho menu sữa và cold brew.",
      category: "tria-lab",
      tags: ["#TriaTester", "#Cupping"],
      authorId: admin.id,
      upvotes: 74,
      views: 1540,
    },
    {
      title: "Mời tham gia Workshop Cupping Fine Robusta sáng Thứ 7 tại TRIA Flagship Q.3",
      content:
        "Workshop diễn ra lúc 09:00 sáng Thứ 7 tại TRIA Flagship Q.3. Số lượng giới hạn 18 người, ưu tiên thành viên Community đăng ký sớm.",
      category: "events",
      tags: ["#WorkshopTRIA", "#HCMC"],
      authorId: admin.id,
      upvotes: 86,
      views: 2100,
    },
    {
      title: "Vệ sinh group head mỗi ngày: checklist 5 phút cho quán đông khách",
      content:
        "Cuối mỗi ca, chạy backflush nước, chải group head, lau shower screen và vệ sinh vòi steam ngay sau khi dùng. Mỗi tuần nên dùng bột vệ sinh theo hướng dẫn của nhà sản xuất.",
      category: "machine-tech",
      tags: ["#BaoDuong", "#BarWorkflow"],
      authorId: owner.id,
      upvotes: 61,
      views: 920,
    },
    {
      title: "Pour-over Fine Robusta: nên dùng nhiệt độ bao nhiêu để vị không gắt?",
      content:
        "Ở 92 độ C, ly có sweetness cân bằng nhất. Giảm nhiệt nếu hậu vị khô; tăng nhẹ nhiệt hoặc kéo dài thời gian bloom nếu ly mỏng và thiếu body.",
      category: "home-barista",
      tags: ["#PourOver", "#Recipe"],
      authorId: barista.id,
      upvotes: 49,
      views: 880,
    },
    {
      title: "Chọn máy pha 2 Group cho quán 80 ly/ngày: bài toán đầu tư và bảo trì",
      content:
        "Nếu lưu lượng ổn định trên 60 ly/ngày, máy 2 Group giúp giảm thời gian chờ và giữ nhiệt tốt hơn. Hãy tính cả chi phí lọc nước, bảo trì định kỳ và training barista vào ngân sách.",
      category: "cafe-owner",
      tags: ["#B2B", "#May2Group"],
      authorId: owner.id,
      upvotes: 88,
      views: 1940,
    },
  ];

  for (const post of posts) {
    const existing = await prisma.communityPost.findFirst({ where: { title: post.title } });
    if (!existing) {
      const created = await prisma.communityPost.create({ data: post });
      await prisma.comment.create({
        data: {
          content: "Cảm ơn anh đã chia sẻ, mình sẽ thử áp dụng ngay tại quán.",
          postId: created.id,
          authorId: barista.id,
          accepted: true,
        },
      });
    } else {
      // Keep demo metrics believable and deterministic when reseeding a dev or
      // staging database. Production traffic can grow these counters afterward.
      await prisma.communityPost.update({
        where: { id: existing.id },
        data: { upvotes: Math.min(post.upvotes, 24), views: Math.min(post.views, 240) },
      });
    }
  }

  // One upcoming workshop so registration has a real target.
  const workshop = await prisma.workshop.findFirst({ where: { title: "Cupping Fine Robusta" } });
  if (!workshop) {
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
    nextSaturday.setHours(9, 0, 0, 0);
    await prisma.workshop.create({
      data: {
        title: "Cupping Fine Robusta",
        locationId: "loc1",
        startsAt: nextSaturday,
        capacity: 18,
      },
    });
  }

  console.log(`Seeded. Demo password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
