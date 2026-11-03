# TRIA CAFE

Website chính thức cho TRIA CAFE - hệ sinh thái cà phê Việt gồm TRIA Beans, TRIA Machines và TRIA Hub.

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- lucide-react

## Authentication & Database

Auth dùng NextAuth v5 với Prisma Adapter và PostgreSQL.

1. Copy `.env.example` thành `.env` và điền `DATABASE_URL`, `AUTH_SECRET` cùng OAuth credentials.
2. Cài dependency và generate Prisma Client:

```bash
npm install
npm run db:generate
npm run db:push
```

3. Chạy app:

```bash
npm run dev
```

Roles: `MEMBER`, `CAFE_OWNER`, `TRIA_BARISTA`, `TRIA_TECH`, `ADMIN`.

- `MEMBER` là role mặc định.
- Đăng ký loại `Chủ quán / Doanh nghiệp F&B` sẽ nhận `CAFE_OWNER`.
- `/admin/*` chỉ cho phép `ADMIN`.
- Server Actions trong `app/actions` yêu cầu session và kiểm tra role khi cần.
- SSO Google/Facebook được bật khi điền đủ `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`; khi đã cấu hình, modal đăng nhập sẽ hiển thị hai nút SSO.
- Google OAuth Authorized redirect URI: `https://<domain>/api/auth/callback/google` (local: `http://localhost:3000/api/auth/callback/google`).
- Facebook OAuth Valid OAuth Redirect URI: `https://<domain>/api/auth/callback/facebook` (local: `http://localhost:3000/api/auth/callback/facebook`).
- Đảm bảo `AUTH_URL` trùng domain đang chạy và không commit các secret OAuth.
- Trình soạn thảo CMS hỗ trợ định dạng rich text, chỉnh HTML (được lọc thẻ/thuộc tính nguy hiểm), chèn ảnh và đính kèm PDF/DOCX/XLSX/TXT/CSV tối đa 10MB mỗi tệp. Media được lưu trong bảng `MediaAsset`.
- Mỗi production build dùng commit SHA làm deployment ID để tránh browser/CDN dùng lẫn client bundle và Server Actions từ các bản deploy khác nhau.

### Quản lý nội dung

- Vào `/admin` → tab **Nội dung** để tạo trang CMS gắn vào nhóm Footer hoặc soạn tin tức/bài viết.
- Trang đã xuất bản có đường dẫn `/noi-dung/{slug}`; tin tức nằm tại `/tin-tuc` và `/tin-tuc/{slug}`.
- Ảnh upload cho cơ sở, sản phẩm và bài viết được lưu dạng Data URL trong PostgreSQL (tối đa 5MB mỗi ảnh). Cân nhắc dung lượng database khi tải nhiều ảnh.
- Sau khi cập nhật mã/schema, chạy `npm run db:generate` và `npm run db:push` để áp dụng model CMS lên database.
