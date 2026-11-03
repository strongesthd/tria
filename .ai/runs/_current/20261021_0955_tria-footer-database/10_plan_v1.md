# Plan v1 — Footer TRIA Động Từ DB

- Ngày: 2026-10-21 09:55 Asia/Saigon
- BA: `00_ba_v1.md`; requirements: `00_requirements_v1.md`; UX: `05_ux_design_v1.md`
- Refactor decision: `NO_REFACTOR`
- Stateful scope: `YES`; transitions `TR-FOOTERLINK-01..05` defined in BA.
- Readiness: plan locked by ORCHESTRATED_SHIP_RUN.

## 1. Goal

Thay footer tĩnh bằng footer nhiều tầng responsive; các nhóm nội dung dùng DB, link policy/support có thể quản lý trong admin. Giữ nguyên shared shell, existing public routes và contact channels.

## 2. Scope

In: FooterLink schema/seed/admin GET/actions/UI; safe input validation; cached bounded queries; visual redesign; tests/build.
Out: legal body content, newsletter, social config, changes to other page data sources, production migration/deploy.

## 3. Constraints and assumptions

- Next.js 15.5.26, Prisma 6/PostgreSQL, NextAuth ADMIN guard.
- Deploy uses `docker compose -f deploy/docker-compose.prod.yml run --rm migrator`.
- Docker daemon is unavailable locally in baseline; build/typecheck run on host.
- Database cache uses bounded 5-minute TTL and tag invalidation after admin mutations.

## 4. Approach

One additive FooterLink model; reuse existing product/branch/post tables; guarded admin endpoint/actions; `Footer` stays in `app/layout.tsx` shared source. No refactor protocol because this is intentional visual and behavior change, not UI_STRUCTURE.

## 4A. State/refactor decision

- `NO_REFACTOR`; preserve header/main/footer placement, contact phone/email and existing destination URLs.
- `Stateful scope: YES`; one-row mutations with ADMIN check; no external side effects; revalidate only on success.
- UI classification: `VISUAL_MODERNIZATION` + `UX_BEHAVIOR_CHANGE`.

```text
TR-ID              SLICE  Boundary                       Positive + negative/failure evidence
TR-FOOTERLINK-01   S01    guarded create action           valid create; invalid/duplicate/non-admin
TR-FOOTERLINK-02   S01    guarded update action            saved update; invalid/missing/non-admin
TR-FOOTERLINK-03   S01    guarded active toggle           hidden after disable; missing/non-admin
TR-FOOTERLINK-04   S01    guarded active toggle           visible after enable; missing/non-admin
TR-FOOTERLINK-05   S01    guarded delete action           removed; missing/non-admin
```

## 5. Slice plan

```text
SLICE  GOAL                                  DELIVERABLES                      DoD                              VERIFY
S01    Persist/manage footer links            Schema, seed, validation, API,     Admin-only CRUD; safe paths;    prisma validate/generate,
                                               actions and admin tab               page/search/status behavior     tsc + focused tests/build
S02    Render dynamic reference footer        bounded cached DB queries,         DB-backed links/cards/articles  tsc + eslint + build,
                                               redesigned public Footer            routes and responsive states    browser smoke
```

## 6. Implementation checklist

S01:
- Add `FooterLinkSection` and `FooterLink`, index and unique key to Prisma schema.
- Add Zod schema for section/label/internal href/order/active.
- Seed policy/support defaults only when absent; preserve owner edits on re-run.
- Add ADMIN-only paginated GET endpoint; validate query bounds.
- Add server actions for create/update/toggle/delete; invalidate footer tag on successful mutations.
- Add a Footer tab/manager using read mode, search/page, edit/create form, pending/error/empty states.
- Add focused tests for safe href and payload validation plus projection/group logic where possible.

S02:
- Add bounded cached data loader with separate unavailable/empty states and no raw DB error details.
- Read active branches (5), active products/category values, newest posts (4), active policy/support links (8/group).
- Redesign existing Footer only; keep `app/layout.tsx` as shell source; use internal routes and encoded map queries.
- Test render destinations, query bounds/projection, empty/error rendering and breakpoints.

## 6A. UX checklist

- UX: `05_ux_design_v1.md`; preserve `app/layout.tsx` shared shell; do not duplicate header/chrome.
- Frame: `max-w-7xl`, current responsive horizontal padding; full-width cream content bands; 5 top groups, experience/contact band, copyright bar.
- Destination: category query from DB, article id detail route, link `href` internal only, branch route/map URL.
- State: DB empty/error, pending/save/error/disabled; admin lists default read mode and uses bounded page/search.
- Design system: existing Tailwind/Lucide only, no global tokens/components.
- Browser: 1440/768/390px, keyboard focus, narrow long text, empty data, 5+ branches, article present, DB unavailable.
- Migration: FooterLink table additive; do not execute production `db push`; document backup/rollback.

## 7. Data/migration

Additive schema update using repository's Prisma db-push migrator. Pre-check current DB and take backup using owner deployment procedure; run migrator once; verify table and seeded records; rollback app first, preserve table/data, drop only after backup and explicit owner decision. No command against production will be run here.

## 8. Verification

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npx eslint <changed ts/tsx files>`
- `npm run build`
- Focused `node --import tsx --test tests/footer-data.test.ts` (if compatible with project runtime).
- Browser at desktop/tablet/mobile; admin positive/negative checks require seeded/local DB and ADMIN session.
- Authz scripts absent; inspect API + each action guard; no new public write route.

## 9. Risks

- Build/runtime DB not reachable: catch safely and preserve footer shell.
- Existing footer in root layout: cache and request cost; use 5-minute bounded cache.
- Schema rollout: deployment runs `db push`; do not apply to production from this task.
- URL injection: schema accepts only safe relative paths.

## 10. Execution

Run S01 then S02; verify each locally. Since Docker daemon is unavailable, use installed Prisma CLI and host checks; DB integration/browser admin behavior is conditional on a reachable local PostgreSQL and must be marked if unavailable.

## 11. Next action

Master plan and slices are locked under `ORCHESTRATED_SHIP_RUN`; proceed through S01 and S02 without routine confirmation.

## 12. Deep thinking

- Weak point: cached dynamic data can be briefly stale; on-demand tag invalidation after admin writes plus 300-second expiry bounds staleness.
- Simpler option: static links avoids schema but violates requested DB-managed content; rejected.
- S01-only state: admin data exists but public layout not yet migrated; not release-complete, so S02 is mandatory.
- Dependencies: S01 schema/actions/manager before public UI; S02 depends on generated Prisma client.
- Complexity: two slices split at data management vs rendering; each is bounded.
- Rollback: additive table remains; code rollback restores prior static footer.
- Proactive proposal: newsletter requires separate consent/unsubscribe/storage requirements; keep out of scope.
- BA Must and all TR IDs map to S01; public source/UX criteria map to S02.
