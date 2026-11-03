# Slice S01 — Footer Links Database and Admin

- Task: `../_task_v1.md`
- BA/Requirements/UX: `../00_ba_v1.md`, `../00_requirements_v1.md`, `../05_ux_design_v1.md`
- Master plan: `../10_plan_v1.md`
- Repo maps: `.ai/runs/persist/00_repo_map_overview.md`, `.ai/runs/persist/01_repo_map_features/tria-footer-database.md`
- References: `AGENTS.md` (not present), `.codex/project-profile.md` (not present)
- Goal: add persistent policy/support links with safe admin CRUD.
- Scope: Prisma, seed, validation, guarded endpoint/actions, admin tab/manager, focused tests.

## Checklist

1. Add section enum and indexed/unique FooterLink table to `prisma/schema.prisma`.
2. Add safe path and bounded text/order validation in `lib/validation.ts`.
3. Seed baseline policy/support links without overwriting existing rows.
4. Add ADMIN-only `/api/admin/footer-links` list with bounded query/pagination.
5. Add ADMIN-guarded create/update/active/delete actions and `site-footer` invalidation.
6. Add manager component and tab in current AdminDashboard; default read mode, pending/error/empty.
7. Add schema validation/branch tests and regenerate Prisma client.

## DoD and verification

- Anonymous/non-admin API reads denied; all mutations validate actor at function boundary.
- External/protocol-relative/backslash links rejected before writes.
- Search and page controls preserve selected section and display correct totals/disabled states.
- Commands: `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, focused test, ESLint changed files.

## Expected files

`prisma/schema.prisma`, `prisma/seed.ts`, `lib/validation.ts`, `app/actions/admin.ts`, `app/api/admin/footer-links/route.ts`, `components/admin/AdminDashboard.tsx`, new `components/admin/FooterLinkManager.tsx`, focused tests.
