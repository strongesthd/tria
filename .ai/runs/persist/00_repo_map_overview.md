# Repo Map Tổng Quan

- Cập nhật: 2026-10-21 09:55 Asia/Saigon
- Phạm vi: website TRIA CAFE, luồng public content và admin hiện có.

## Mục tiêu và cấu trúc cấp cao

Next.js 15 App Router với React 19, Tailwind CSS 4, NextAuth v5 và PostgreSQL qua Prisma.

```text
app/                 Pages, layouts, server actions và API routes
components/          Sections, shop, community, admin và auth UI
lib/                 Prisma client, validation, site constants và helpers
prisma/              Schema và seed
public/images/       Brand assets
deploy/              Docker Compose production
```

## Luồng dữ liệu liên quan

- `app/layout.tsx` dùng shared header/footer cho toàn bộ public pages.
- `components/sections/Footer.tsx` hiện đọc branch/category/navigation từ constants trong `lib/site-data.ts`.
- `Product`, `Branch`, `CommunityPost` đã tồn tại trong PostgreSQL schema. Product/Branch có active state và admin CRUD; bài cộng đồng có public list/detail routes.
- Admin page dùng `components/admin/AdminDashboard.tsx`, API routes ở `app/api/admin/*`, server actions ở `app/actions/admin.ts`.
- Public content không có auth; admin route/actions/API kiểm tra `Role.ADMIN`.

## Cấu hình và validation

- `DATABASE_URL`, `AUTH_SECRET`, OAuth settings trong env; không đọc/ghi secret vào report.
- `npm run build`, `npx tsc --noEmit`; chưa có test script hoặc authz audit script.
- Deploy dùng Prisma `db push` qua migrator service trong `deploy/docker-compose.prod.yml`.
- Không tìm thấy `AGENTS.md`, `.codex/project-profile.md`, repo maps hoặc recommendation logs hiện hữu.

## Feature Maps

- [Footer động từ DB](01_repo_map_features/tria-footer-database.md)
