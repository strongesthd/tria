# Implement v1 — Footer TRIA Động Từ DB

- Ngày: 2026-10-21
- Slice: S01 — Footer links database và admin
- Trạng thái: Done (implement-part)
- Workflow mode: `ORCHESTRATED_SHIP_RUN`
- Plan: `10_plan_v2.md`, `S01_plan_v1.md`
- UX: `05_ux_design_v2.md`

## Đã triển khai

- [x] Thêm `FooterLinkSection` và model `FooterLink`, unique section+label, index section/active/sort order.
- [x] Thêm Zod validation cho group, label, internal href và sort order.
- [x] Seed 8 policy/support links bằng `createMany(skipDuplicates)` để giữ nguyên chỉnh sửa admin khi seed lại.
- [x] Thêm ADMIN-only API list, search, group filter, pagination giới hạn 20 dòng và clamp page theo total.
- [x] Thêm ADMIN-only create/update/active/delete server actions; runtime-check ID/boolean; map duplicate/not-found sang thông báo an toàn.
- [x] Thêm cache tag invalidation chỉ sau mutation thành công.
- [x] Thêm tab admin Footer và list/form read-mode với empty/loading/error/pending, search/group filter và trang đầu/cuối.
- [x] Thêm test validation, cập nhật npm test script.

## Files changed

```text
MODIFY  prisma/schema.prisma                  Thêm enum/model FooterLink.
MODIFY  prisma/seed.ts                        Thêm dữ liệu khởi tạo không ghi đè.
MODIFY  lib/validation.ts                     Thêm schema kiểm tra link footer.
MODIFY  app/actions/admin.ts                  CRUD ADMIN-only và cache invalidation.
NEW     app/api/admin/footer-links/route.ts   API danh sách riêng tư, có phân trang.
NEW     components/admin/FooterLinkManager.tsx UI quản lý footer links.
MODIFY  components/admin/AdminDashboard.tsx  Thêm tab Footer.
MODIFY  package.json                          Thêm test script cho Node test runner.
NEW     tests/footer-link-validation.test.ts  Bốn nhóm test validation.
```

## State/Auth conformance

- `TR-FOOTERLINK-01`: valid payload tạo record; duplicate section+label trả lỗi an toàn.
- `TR-FOOTERLINK-02`: update record; invalid input/missing record bị từ chối.
- `TR-FOOTERLINK-03/04`: active boolean được kiểm runtime và update qua ADMIN boundary.
- `TR-FOOTERLINK-05`: delete qua ADMIN boundary; missing record trả lỗi.
- API GET xác thực `Role.ADMIN` trước truy vấn. Mọi server action gọi `requireAdmin()` trước mutation.
- DB integration của create/update/toggle/delete chưa chạy vì Docker daemon không khả dụng và không xác nhận PostgreSQL local; không thực hiện DB push.

## Test plan / Branch matrix

```text
BEHAVIOR                HAPPY   INVALID/PERMISSION   MISSING/ERROR   EVIDENCE
Href + label validation  PASS    PASS                 N/A             tests/footer-link-validation.test.ts
Section/order validation PASS    PASS                 N/A             tests/footer-link-validation.test.ts
Admin GET permission     PENDING  CODE-GUARDED         N/A             app/api/admin/footer-links/route.ts
DB mutations             PENDING  CODE-GUARDED         PENDING         Local DB integration unavailable
```

## Micro-verification

- `npx prisma validate` — PASS.
- `npx prisma generate` — PASS, Prisma Client 6.16.2 generated locally; no DB mutation.
- `npm test` — PASS, 4 tests.
- `npx tsc --noEmit` — PASS.
- `npx eslint ...` — 0 errors; one pre-existing warning `InfoPanel` unused at `components/admin/AdminDashboard.tsx:166`.
- `git diff --check` — PASS.

## Notes

- `npm test` initially passed a directory to Node as an ESM module and failed; package script now names the test file explicitly and the rerun passes.
- No undeclared refactor. Schema change is additive and requires deploy-time Prisma db push.
- Log finalization: `DEFERRED_TO_SHIP`.
- No recommendation change identified.
