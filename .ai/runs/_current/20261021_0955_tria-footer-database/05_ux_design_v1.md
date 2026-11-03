# UX Design: Footer TRIA Động Từ DB

- Ngày: 2026-10-21 09:55 Asia/Saigon
- Phiên bản: v1
- Nguồn: yêu cầu + ảnh tham chiếu người dùng; codebase hiện tại.
- Kết luận: READY

## Chẩn đoán hiện trạng

- As-is: `app/layout.tsx` reuse `components/sections/Footer.tsx`; footer hiện tại tối màu, bốn cột chữ nhỏ, link branches/categories lấy từ constants.
- Pain points: không có danh sách bài viết; chính sách/tư vấn hard-code; không có card địa điểm/contact band như hình; hiện chưa có trang quản trị link footer.
- Bằng chứng: `components/sections/Footer.tsx`, `lib/site-data.ts`, `prisma/schema.prisma`, `components/admin/AdminDashboard.tsx`.
- UI Change Classification: `VISUAL_MODERNIZATION` + `UX_BEHAVIOR_CHANGE`. Có bố cục/màu mới có chủ đích và nội dung chuyển sang DB/admin CRUD; không phải UI_STRUCTURE.

## Flow, người dùng và tác vụ

- Khách hàng: xem nhanh danh mục, đọc bài viết, tìm chính sách, chọn điểm trải nghiệm hoặc mở kênh tư vấn.
- Admin: `/admin` → tab “Footer” → tìm/lọc → thêm/sửa/ẩn/xóa liên kết → thay đổi phản ánh ở footer sau cache invalidation.
- Primary job (public): điều hướng tới nội dung và địa điểm phù hợp.
- Primary object: danh mục/bài viết/chính sách/tư vấn/chi nhánh.
- Primary action: mở route nội bộ hoặc bản đồ chi nhánh.
- Recovery: DB lỗi hiển thị footer shell và trạng thái nội dung chưa tải; link rỗng hiển thị empty message; admin lỗi giữ form/dữ liệu và thông báo lỗi.

```text
Trang bất kỳ
  -> Footer: danh mục DB / bài viết DB / chính sách DB / tư vấn DB
  -> Chi nhánh DB -> mở trang hệ thống quán hoặc Google Maps
Admin -> Footer -> CRUD link -> invalidate cache -> footer cập nhật
```

## Screen inventory và destination contract

- Reuse: shared shell `app/layout.tsx`; footer root component hiện hữu; admin shell `/admin`; article detail `/cong-dong/[id]`; product listing `/san-pham`; location/booking `/he-thong-quan#booking`.
- Mới: tab quản trị Footer trong dashboard, không tạo page/route UI riêng.
- Danh mục: `/san-pham?category=<category từ Product.category>`.
- Bài viết: `/cong-dong/<CommunityPost.id>`.
- Chính sách/tư vấn: `FooterLink.href` phải là đường dẫn nội bộ bắt đầu bằng một `/`; route giữ nguyên như dữ liệu quản trị.
- Điểm trải nghiệm: `/he-thong-quan#<Branch.slug>`; nút bản đồ dùng Google Maps search theo địa chỉ.
- Không tạo link self-loop hoặc URL external trong FooterLink. Hư cấu/mất context không áp dụng.

## Layout và component contract

- Chrome source of truth: `app/layout.tsx` render `Header`, `main`, `Footer`; chỉ sửa nội dung của `components/sections/Footer.tsx`, không duplicate shell/header.
- Existing action contract: `CatalogManager` là mẫu admin CRUD phân trang/search; `ProductManager`/`BranchManager` giữ nguyên.
- Page frame: full-width bands, inner `max-w-7xl`, horizontal padding theo shell hiện có; footer gồm:

```text
┌ Brand ┬ Danh mục ┬ Bài viết ┬ Chính sách ┬ Tư vấn ┐
├ Điểm trải nghiệm: cards DB (ảnh, địa chỉ, giờ, bản đồ) ┬ Liên hệ ┤
└ Dải bản quyền + link pháp lý ┘
```

- Desktop: 5 cột link; experience cards tối đa 5, contact panel cạnh bên. Tablet/mobile: nhóm link xếp gọn, địa điểm 1-2 cột, contact dưới; không ép bảng ngang hoặc text tràn.
- Màu footer tham chiếu sáng/ấm, accent cam thương hiệu, giữ typography và `max-w-7xl`; dùng local styling, không mở rộng global design system.
- Không dùng newsletter vì chưa có subscription endpoint/consent flow; không thêm action giả.

## State matrix

- Source of truth: PostgreSQL `Branch`, `Product`, `CommunityPost`, `FooterLink`.
- Public: loaded; empty theo từng nhóm; DB unavailable. Chỉ đọc `active=true`; giới hạn 5 chi nhánh, 4 bài, tối đa 8 link/nhóm.
- Admin: mặc định read mode; search/page; tạo/sửa; save pending/success/error; active/inactive; missing ID; permission denied.
- `FooterLink.active` là state persisted. Admin là actor duy nhất có thể đổi; public chỉ đọc bản active.

## Wording

- Heading: “Danh mục sản phẩm”, “Bài viết mới”, “Chính sách”, “Tư vấn & hỗ trợ”, “Điểm trải nghiệm”.
- Empty: “Chưa có nội dung đang hiển thị.”; DB error: “Nội dung đang được cập nhật.”
- Admin actions: “Thêm liên kết”, “Lưu”, “Ẩn/Hiện”, “Xóa”; lỗi validation nêu rõ label/đường dẫn.

## Design system check

- Reuse lucide-react, Tailwind utilities, typography, content width, icons and warm accent already present.
- Không tạo global token/component library; không có OWNER APPROVAL REQUIRED.

## Acceptance criteria và smoke

- Footer luôn render brand/license; các nhóm dữ liệu lấy từ DB, không còn dùng static branches/categories/nav arrays.
- Bài viết link tới detail route; category link giữ đúng raw category query; bản đồ dùng URL mã hóa địa chỉ.
- Link inactive không render; create/update/toggle/delete chỉ cho ADMIN; sai role bị từ chối ở server action/API.
- Chỉ nhận internal path an toàn; từ chối `javascript:`, `//host`, backslash, empty/oversize values.
- Query giới hạn; thứ tự theo sort order/createdAt; cache tối đa 5 phút và admin mutation invalidates đúng tag.
- Empty/error state không làm sập layout; nội dung dài wrap; ảnh DB không làm layout nhảy.
- Kiểm browser desktop 1440px, tablet 768px, mobile 390px; keyboard/focus, link destinations, 0/1/5 branches, 0/4 posts, >8 links, DB unavailable.

## Tác động BA/Plan

- Must: schema FooterLink, seed defaults, protected admin CRUD, query/cache/error handling, visual footer and data-driven sections.
- Should: không thêm newsletter/social integrations; không thay nội dung các trang chính sách.
