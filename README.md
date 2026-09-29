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
- OAuth callback cần cấu hình redirect URL `/api/auth/callback/google` và `/api/auth/callback/facebook`.
