# UX Design v2 — Footer TRIA Động Từ DB

- Ngày: 2026-10-21 10:01 Asia/Saigon
- Tham chiếu: `05_ux_design_v1.md`
- Lý do: xác nhận destination contract cho chi nhánh lấy động từ DB.
- Kết luận: READY

## Bổ sung / Thay đổi

- Thay destination cho CTA của card điểm trải nghiệm: mở Google Maps search theo `Branch.address` đã encode, không dùng `/he-thong-quan#<slug>`. Trang hệ thống quán hiện vẫn render từ constants, nên anchor không bảo đảm tồn tại với branch DB mới.
- Card vẫn trình bày tên/ảnh/địa chỉ/giờ từ DB; CTA “Xem bản đồ” là external destination cố định về Google Maps, mở tab mới với `rel="noreferrer"`.
- Thay đổi này supersedes mục branch destination trong `05_ux_design_v1.md`; các phần khác giữ nguyên.

## Destination contract

```text
Source: card của một Branch active
Label: Xem bản đồ
URL: https://www.google.com/maps/search/?api=1&query=<encodeURIComponent(address)>
Context: địa chỉ branch từ DB, URL-encoded
Permission: public
Fallback: không render CTA nếu address rỗng (schema hiện yêu cầu address)
Anti self-loop: không áp dụng; target là external map search
```
