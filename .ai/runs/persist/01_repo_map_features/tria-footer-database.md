# Repo Map: Footer Động Từ DB

- Cập nhật: 2026-10-21 09:55 Asia/Saigon

## Mục tiêu

Footer public theo layout tham chiếu; danh mục sản phẩm, điểm trải nghiệm, bài viết, chính sách và tư vấn hiển thị từ DB.

## File/module liên quan

- `app/layout.tsx`: shared shell, gọi `Footer`.
- `components/sections/Footer.tsx`: footer hiện tại, đang phụ thuộc static constants.
- `lib/site-data.ts`: các dữ liệu demo/constants cũ.
- `lib/prisma.ts`: Prisma singleton.
- `prisma/schema.prisma`: Product, Branch, CommunityPost và bảng FooterLink mới.
- `prisma/seed.ts`: demo records.
- `app/cong-dong/[id]/page.tsx`: route chi tiết bài viết.
- `app/actions/admin.ts`, `app/api/admin/footer-links/route.ts`: protected management operations.
- `components/admin/AdminDashboard.tsx`, `components/admin/FooterLinkManager.tsx`: tab quản trị footer.

## Luồng chính

Admin `Role.ADMIN` tạo/sửa/kích hoạt/ẩn/xóa FooterLink; server xác thực dữ liệu/path, ghi một bản ghi DB rồi invalidate tag `site-footer`. Public server component query active branches, distinct active product categories, latest community posts và active links theo section. Lỗi DB giữ footer shell render được và báo trạng thái nội dung chưa khả dụng.

## Phụ thuộc và rủi ro

- PostgreSQL/Prisma schema deployment; local Docker daemon không chạy trong lần index này.
- Footer nằm trong root layout nên query phải bounded, cached và có error boundary ở data function.
- FooterLink là public navigation: chỉ internal path, không cho protocol-relative/backslash URL.
- Không có authz registry/test framework trong repo; dùng cùng `Role.ADMIN` guard pattern hiện tại.
