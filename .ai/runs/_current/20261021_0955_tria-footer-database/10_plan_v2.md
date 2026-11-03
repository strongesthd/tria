# Plan v2 — Footer TRIA Động Từ DB

- Ngày: 2026-10-21 10:01 Asia/Saigon
- Tham chiếu: `10_plan_v1.md`
- Lý do bổ sung: cập nhật branch destination contract theo BA v2.
- BA nguồn: `00_ba_v2.md`
- UX nguồn: `05_ux_design_v2.md`

## Bổ sung / Thay đổi so với plan trước

- S02 branch card action mở `https://www.google.com/maps/search/?api=1&query=<encoded address>`; không link anchor của `/he-thong-quan`.
- Verification phải assert exact map origin/path và encoded address query.
- Phạm vi files/schema, S01, cache, admin, styling và các acceptance criteria khác của Plan v1 giữ nguyên.

## Slice bị ảnh hưởng

- S02 dùng slice plan `S02_plan_v2.md`; plan v1 được giữ nguyên làm lịch sử.
