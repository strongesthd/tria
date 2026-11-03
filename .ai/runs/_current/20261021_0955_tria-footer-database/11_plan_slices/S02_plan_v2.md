# Slice S02 Plan v2 — Dynamic Footer Presentation

- Ngày: 2026-10-21 10:01 Asia/Saigon
- Tham chiếu: `S02_plan_v1.md`
- Master plan: `../10_plan_v2.md`
- UX/BA: `../05_ux_design_v2.md`, `../00_ba_v2.md`

## Thay đổi

- Branch cards lấy fields từ `Branch` DB, CTA “Xem bản đồ” mở Google Maps search theo `encodeURIComponent(address)`.
- Không dùng `/he-thong-quan#slug` do route đó chưa render các branch DB động.
- DoD bổ sung: assert `href` dùng origin/path Google Maps chính xác và query address đã encode; external link có `target="_blank"` và `rel="noreferrer"`.
- Các checklist và DoD còn lại của `S02_plan_v1.md` giữ nguyên.
