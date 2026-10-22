import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: "bao-mat",
    title: "Chính sách bảo mật",
    summary: "Chính sách thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân tại TRIA CAFE.",
    sortOrder: 10,
    content: `<p>TRIA CAFE tôn trọng quyền riêng tư và xử lý dữ liệu cá nhân theo mục đích minh bạch, cần thiết cho vận hành website, hỗ trợ khách hàng và cung cấp dịch vụ.</p><h2>1. Dữ liệu được thu thập</h2><p>Tùy tương tác, TRIA có thể thu thập họ tên, email, số điện thoại/Zalo, địa chỉ giao hàng, thông tin booking, nhu cầu hợp tác, nội dung bài viết/bình luận và dữ liệu kỹ thuật cần thiết như IP, thiết bị, log truy cập.</p><h2>2. Mục đích sử dụng</h2><p>Dữ liệu được dùng để tạo tài khoản, xác thực, xử lý đơn hàng, đặt lịch, trả lời yêu cầu, quản lý cộng đồng, chống gian lận, cải thiện sản phẩm và thực hiện nghĩa vụ pháp lý.</p><ul><li>Không bán dữ liệu cá nhân cho bên thứ ba.</li><li>Chỉ chia sẻ phần cần thiết với nhà cung cấp vận chuyển, thanh toán, lưu trữ hoặc nền tảng kỹ thuật để hoàn thành dịch vụ.</li><li>Có thể gửi thông tin chăm sóc/marketing khi bạn đồng ý hoặc pháp luật cho phép; bạn có thể từ chối.</li></ul><h2>3. Lưu trữ và bảo vệ</h2><p>TRIA áp dụng kiểm soát truy cập, mật khẩu băm, rate limit, security headers và phân quyền quản trị. Không phương thức truyền/lưu trữ nào tuyệt đối an toàn; hãy báo ngay khi nghi ngờ tài khoản bị xâm nhập.</p><h2>4. Quyền của bạn</h2><p>Bạn có quyền yêu cầu biết, truy cập, chỉnh sửa, rút lại đồng ý, hạn chế xử lý hoặc xóa dữ liệu trong phạm vi pháp luật. Gửi yêu cầu tới hello@triacafe.vn; TRIA có thể cần xác minh danh tính trước khi xử lý.</p><h2>5. Cookie và dịch vụ bên thứ ba</h2><p>Website có thể dùng cookie cần thiết cho phiên đăng nhập, giỏ hàng và bảo mật. Hình ảnh CDN, OAuth hoặc dịch vụ phân tích có chính sách riêng; bạn nên xem chính sách của nhà cung cấp tương ứng.</p>`,
  },
  {
    slug: "dieu-khoan",
    title: "Điều khoản sử dụng",
    summary: "Điều khoản sử dụng website, tài khoản, mua hàng và dịch vụ TRIA CAFE.",
    sortOrder: 20,
    content: `<p>Khi truy cập website, tạo tài khoản, đăng nội dung hoặc mua sản phẩm/dịch vụ của TRIA CAFE, bạn xác nhận đã đọc và đồng ý tuân thủ các điều khoản này.</p><h2>1. Phạm vi và chấp nhận điều khoản</h2><p>Website triacafe.vn do TRIA CAFE vận hành để cung cấp thông tin thương hiệu, sản phẩm, cộng đồng, đặt lịch trải nghiệm và tiếp nhận nhu cầu hợp tác. TRIA có thể cập nhật điều khoản khi cần; phiên bản mới có hiệu lực từ thời điểm đăng tải.</p><h2>2. Tài khoản người dùng</h2><p>Bạn chịu trách nhiệm cung cấp thông tin chính xác, bảo vệ mật khẩu và mọi hoạt động phát sinh từ tài khoản. Không được chia sẻ, mua bán, cho thuê tài khoản hoặc sử dụng tài khoản để mạo danh người khác.</p><ul><li>Tài khoản phải sử dụng email/số điện thoại có quyền kiểm soát hợp pháp.</li><li>TRIA có thể tạm khóa tài khoản khi phát hiện gian lận, spam, xâm phạm quyền người khác hoặc vi phạm pháp luật.</li><li>Bạn có thể yêu cầu hỗ trợ khóa/xóa tài khoản qua hello@triacafe.vn.</li></ul><h2>3. Sản phẩm, giá và đơn hàng</h2><p>Thông tin giá, tồn kho, hình ảnh và mô tả được cập nhật theo từng thời điểm. Đơn hàng chỉ được xác nhận sau khi TRIA tiếp nhận và liên hệ xác nhận. Giá hiển thị có thể thay đổi trước thời điểm xác nhận đơn.</p><p>Khách hàng không được sử dụng hệ thống để tạo đơn giả, khai thác lỗi giá, gian lận khuyến mại hoặc gây thiệt hại cho TRIA/đối tác vận chuyển.</p><h2>4. Sở hữu trí tuệ</h2><p>Logo, tên thương hiệu, giao diện, nội dung, hình ảnh và tài liệu của TRIA CAFE thuộc TRIA hoặc bên cấp phép. Bạn không được sao chép, sửa đổi, phân phối, dùng thương mại hoặc đăng ký dấu hiệu gây nhầm lẫn nếu chưa có chấp thuận bằng văn bản.</p><h2>5. Giới hạn trách nhiệm</h2><p>TRIA nỗ lực duy trì website an toàn và chính xác nhưng không cam kết dịch vụ luôn không gián đoạn hoặc không có lỗi. TRIA không chịu trách nhiệm cho thiệt hại phát sinh từ việc bạn cung cấp thông tin sai, làm lộ tài khoản, sử dụng dịch vụ trái phép hoặc sự cố ngoài khả năng kiểm soát hợp lý.</p><h2>6. Liên hệ và khiếu nại</h2><p>Khiếu nại về đơn hàng, nội dung hoặc quyền lợi có thể gửi tới hello@triacafe.vn hoặc hotline 0989 668 113 / 0983 020 629. Vui lòng cung cấp URL, thời điểm và bằng chứng liên quan để TRIA xử lý nhanh hơn.</p>`,
  },
  {
    slug: "cong-dong",
    title: "Quy định cộng đồng",
    summary: "Quy tắc đăng bài, bình luận, ảnh đính kèm và xử lý vi phạm tại TRIA Community.",
    sortOrder: 30,
    content: `<p>TRIA Community là không gian chia sẻ kinh nghiệm cà phê. Mọi thành viên phải tôn trọng pháp luật, quyền riêng tư và quyền sở hữu trí tuệ của người khác.</p><h2>1. Nội dung được khuyến khích</h2><p>Chia sẻ công thức, trải nghiệm máy/hạt, kiến thức vận hành quán, bảo dưỡng, workshop và câu hỏi có ích cho cộng đồng. Hãy đưa thông tin chính xác, nêu rõ trải nghiệm cá nhân và nguồn khi trích dẫn.</p><h2>2. Nội dung bị cấm</h2><p>TRIA có quyền ẩn, chỉnh sửa, gỡ hoặc khóa tài khoản đối với nội dung vi phạm.</p><ul><li>Nội dung trái pháp luật, kích động bạo lực, thù ghét, quấy rối, đe dọa hoặc xâm hại trẻ em.</li><li>Mạo danh, lừa đảo, spam, quảng cáo không được phép, seeding giả hoặc thao túng vote/điểm.</li><li>Tiết lộ dữ liệu cá nhân, số điện thoại, địa chỉ, hình ảnh của người khác khi chưa được đồng ý.</li><li>Nội dung xâm phạm bản quyền, nhãn hiệu, bí mật kinh doanh hoặc sử dụng ảnh không có quyền.</li><li>Thông tin y tế, tài chính, pháp lý nguy hiểm được trình bày như cam kết chuyên môn.</li></ul><h2>3. Ảnh và file đính kèm</h2><p>Bạn chỉ được tải ảnh/file mà bạn có quyền sử dụng và không chứa dữ liệu nhạy cảm của người khác. File upload hiện giới hạn tối đa 5MB mỗi ảnh; TRIA có thể xóa file nguy hiểm, vi phạm hoặc gây rủi ro bảo mật.</p><h2>4. Báo cáo và xử lý</h2><p>Gửi báo cáo tới hello@triacafe.vn với URL bài viết/bình luận, lý do và bằng chứng. TRIA sẽ ưu tiên xử lý nội dung nguy hiểm, xâm phạm trẻ em, lừa đảo hoặc vi phạm dữ liệu cá nhân. Trong trường hợp cần thiết, TRIA có thể phối hợp với cơ quan có thẩm quyền.</p><h2>5. Quyền với nội dung thành viên</h2><p>Bạn giữ quyền đối với nội dung do mình tạo nhưng cấp cho TRIA quyền không độc quyền để lưu trữ, hiển thị và phân phối nội dung đó nhằm vận hành Community. Bạn cam kết có đủ quyền và chịu trách nhiệm với nội dung đã đăng.</p>`,
  },
  {
    slug: "quyen-loi",
    title: "Quyền lợi và trách nhiệm",
    summary: "Quyền lợi, nghĩa vụ và trách nhiệm của khách hàng, thành viên và đối tác TRIA CAFE.",
    sortOrder: 40,
    content: `<p>Trang này giải thích ngắn gọn quyền lợi và trách nhiệm của khách hàng mua hàng, thành viên Community và đối tác hợp tác điểm bán.</p><h2>1. Quyền lợi khách hàng</h2><p>Khách hàng có quyền nhận thông tin sản phẩm rõ ràng, được xác nhận đơn, hỗ trợ kỹ thuật, tư vấn phù hợp và tiếp nhận xử lý khiếu nại theo chính sách từng dịch vụ/đơn hàng.</p><h2>2. Trách nhiệm khách hàng</h2><p>Khách hàng cần cung cấp thông tin nhận hàng chính xác, kiểm tra sản phẩm khi nhận, sử dụng máy/phụ kiện theo hướng dẫn, không lạm dụng khuyến mại và thanh toán đúng cam kết.</p><h2>3. Quyền lợi thành viên</h2><p>Thành viên có thể tham gia thảo luận, bình luận, bình chọn, tích điểm và nhận thông tin cộng đồng theo điều kiện chương trình. Điểm, badge hoặc ưu đãi không mặc nhiên có giá trị tiền mặt và có thể thay đổi theo thể lệ.</p><h2>4. Trách nhiệm thành viên</h2><p>Thành viên chịu trách nhiệm về nội dung đã đăng, tôn trọng người khác, bảo vệ tài khoản và báo cáo nội dung vi phạm. Không dùng Community cho mục đích trái pháp luật, spam hoặc quảng cáo trái phép.</p><h2>5. Đối tác và điểm bán</h2><p>Lead hợp tác chỉ là nhu cầu ban đầu, không phải cam kết cấp quyền hay bảo đảm doanh thu. Các điều kiện vị trí, đầu tư, chia sẻ doanh thu, đào tạo và hỗ trợ phải được xác nhận bằng hợp đồng/tài liệu riêng trước khi triển khai.</p>`,
  },
];

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
      images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600"],
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
      images: ["https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&q=80&w=600"],
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
      images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=600"],
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
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"],
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
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"],
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
      address: "Số 641 Nguyễn Duy Trinh, Phường Phú Hữu, TP. Thủ Đức, TP. Hồ Chí Minh",
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
    {
      slug: "ha-noi-mo-lao",
      name: "TRIA Hà Nội - Mỗ Lao",
      address: "Số 46-47, Liền kề 11B, KĐT Mỗ Lao, Phường Hà Đông, Hà Nội",
      hours: "Liên hệ để đặt lịch trải nghiệm",
      phone: "0989 668 113",
      features: ["Tư vấn & trải nghiệm sản phẩm TRIA"],
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
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

  for (const page of legalPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        footerSection: "POLICY",
        published: true,
      },
    });
  }
  console.log(`✅ ${legalPages.length} legal pages synced to CMS`);

  const footerLinks = [
    { section: "POLICY" as const, label: "Chính sách bảo mật", href: "/noi-dung/bao-mat", sortOrder: 10 },
    { section: "POLICY" as const, label: "Điều khoản sử dụng", href: "/noi-dung/dieu-khoan", sortOrder: 20 },
    { section: "POLICY" as const, label: "Quy định cộng đồng", href: "/noi-dung/cong-dong", sortOrder: 30 },
    { section: "POLICY" as const, label: "Quyền lợi & trách nhiệm", href: "/noi-dung/quyen-loi", sortOrder: 40 },
    { section: "SUPPORT" as const, label: "Tư vấn & đặt lịch trải nghiệm", href: "/he-thong-quan#booking", sortOrder: 10 },
    { section: "SUPPORT" as const, label: "Giải pháp cho quán cà phê", href: "/giai-phap-b2b", sortOrder: 20 },
    { section: "SUPPORT" as const, label: "Hợp tác điểm bán", href: "/hop-tac", sortOrder: 30 },
    { section: "SUPPORT" as const, label: "Hỏi đáp cộng đồng", href: "/cong-dong", sortOrder: 40 },
  ];

  for (const link of footerLinks) {
    await prisma.footerLink.upsert({
      where: { section_label: { section: link.section, label: link.label } },
      update: { href: link.href },
      create: link,
    });
  }
  console.log(`✅ ${footerLinks.length} footer links synced`);

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
