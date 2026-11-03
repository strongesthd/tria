# Slice S02 — Dynamic Footer Presentation

- Task: `../_task_v1.md`
- BA/Requirements/UX: `../00_ba_v1.md`, `../00_requirements_v1.md`, `../05_ux_design_v1.md`
- Master plan: `../10_plan_v1.md`
- Repo maps: `.ai/runs/persist/00_repo_map_overview.md`, `.ai/runs/persist/01_repo_map_features/tria-footer-database.md`
- References: `AGENTS.md` (not present), `.codex/project-profile.md` (not present)
- Goal: match the supplied footer structure while reading public content from PostgreSQL.
- Scope: footer data service/cache and `components/sections/Footer.tsx` only; shell remains in `app/layout.tsx`.

## Checklist

1. Add bounded query loader for active branches, distinct active categories, newest posts and active FooterLinks.
2. Cache loader for 300 seconds with `site-footer` tag; catch DB failure without logging raw errors.
3. Render brand + five link columns, limited experience cards, contact panel and copyright bar.
4. Use existing product/category/article/branch destination routes and encoded map queries.
5. Add per-section empty and database-unavailable states; long text wraps and branch image aspect ratio is stable.
6. Keep mobile cards in responsive grid/scroll-safe layout, no horizontal page overflow.
7. Revalidate against 1440, 768, 390 widths and run full available code checks.

## DoD and verification

- No branch/category/footer navigation data comes from `BRANCHES`, `PRODUCT_CATEGORIES`, or `NAV_ITEMS`.
- Post links resolve to `/cong-dong/[id]`; product links preserve DB category; map query encodes DB address.
- Inactive rows not rendered; each query has explicit take/distinct bounds.
- Shell source remains `app/layout.tsx`; `Footer.tsx` owns content only.
- Commands: `npx tsc --noEmit`, `npx eslint components/sections/Footer.tsx lib/footer-data.ts`, `npm run build`; browser smoke or explicit environment gap.

## Expected files

`components/sections/Footer.tsx`, new `lib/footer-data.ts`, tests as needed.
