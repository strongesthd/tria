"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartDrawer() {
  const { items, count, total, remove, updateQuantity, clear, open, setOpen } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) return null;

  const closeAll = () => {
    setOpen(false);
    setCheckoutOpen(false);
    setSubmitted(false);
    setError(null);
  };

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      const payload = {
        name: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
      };
      // Post to the order endpoint; the client never handles payment data itself.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không thể tạo đơn hàng. Vui lòng thử lại.");
      }
      setSubmitted(true);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={closeAll} role="dialog" aria-modal="true" aria-label="Giỏ hàng">
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FDFBF7] text-[#1C1613] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#E8DED2] px-6 pb-5 pt-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D97706]">TRIA CAFE</p>
            <h2 className="mt-1 text-2xl font-bold">{checkoutOpen ? "Thanh toán đơn hàng" : "Giỏ hàng của bạn"}</h2>
            <p className="mt-1 text-xs text-[#756A61]">
              {checkoutOpen ? "Xác nhận thông tin nhận hàng" : `${count} sản phẩm đã chọn`}
            </p>
          </div>
          <button type="button" aria-label="Đóng giỏ hàng" onClick={closeAll} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E9DF] transition hover:bg-[#E8DED2]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {checkoutOpen ? (
          submitted ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F2E8] text-[#34724A]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-bold">Đã tiếp nhận đơn hàng</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#756A61]">
                TRIA CAFE sẽ gọi lại cho bạn trong ít phút để xác nhận đơn và phương thức thanh toán.
              </p>
              <button type="button" onClick={closeAll} className="mt-7 w-full rounded-xl bg-[#1C1613] py-3.5 text-sm font-bold text-white transition hover:bg-[#332923]">
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
              <button type="button" onClick={() => setCheckoutOpen(false)} className="mb-6 flex w-fit items-center gap-2 text-sm font-semibold text-[#756A61] transition hover:text-[#1C1613]">
                <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
              </button>
              <div className="space-y-4">
                <label className="block text-sm font-semibold">
                  Họ và tên
                  <input name="name" required maxLength={120} className="mt-2 w-full rounded-xl border border-[#E8DED2] bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#C87D55]" placeholder="Nhập họ và tên" />
                </label>
                <label className="block text-sm font-semibold">
                  Số điện thoại
                  <input name="phone" type="tel" required maxLength={20} className="mt-2 w-full rounded-xl border border-[#E8DED2] bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#C87D55]" placeholder="0901 xxx xxx" />
                </label>
                <label className="block text-sm font-semibold">
                  Địa chỉ nhận hàng
                  <textarea name="address" required maxLength={500} className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#E8DED2] bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#C87D55]" placeholder="Số nhà, đường, phường/xã..." />
                </label>
                {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              </div>
              <div className="mt-auto border-t border-[#E8DED2] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[#756A61]">Tạm tính</span>
                  <span className="text-lg font-extrabold text-[#D97706]">{total.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C1613] py-3.5 text-sm font-bold text-white transition hover:bg-[#332923] disabled:opacity-60">
                  <CreditCard className="h-4 w-4" /> {pending ? "Đang gửi..." : "Xác nhận đặt hàng"}
                </button>
              </div>
            </form>
          )
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-[#C87D55]" />
                  <p className="mt-3 text-sm text-[#756A61]">Chưa có sản phẩm nào trong giỏ.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 border-b border-[#E8DED2] pb-4">
                      <Image src={item.image} alt={item.name} width={64} height={64} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug">{item.name}</p>
                        <p className="mt-1 text-xs text-[#756A61]">{item.unit}</p>
                        <p className="mt-1 text-sm font-bold text-[#D97706]">{(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#E8DED2] bg-white">
                          <button type="button" aria-label={`Giảm số lượng ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-[#756A61] transition hover:text-[#1C1613]">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span>
                          <button type="button" aria-label={`Tăng số lượng ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-[#756A61] transition hover:text-[#1C1613]">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <button type="button" aria-label={`Xóa ${item.name} khỏi giỏ`} onClick={() => remove(item.id)} className="self-start text-[#A69B93] transition hover:text-[#B54C3B]">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-[#E8DED2] bg-[#FBF7F1] px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-[#756A61]">Tổng tạm tính</span>
                <span className="text-xl font-extrabold text-[#1C1613]">{total.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" disabled={!items.length} onClick={closeAll} className="rounded-xl border border-[#1C1613] bg-transparent px-3 py-3 text-sm font-bold text-[#1C1613] transition hover:bg-[#F1E9DF] disabled:cursor-not-allowed disabled:opacity-40">
                  Tiếp tục mua hàng
                </button>
                <button type="button" disabled={!items.length} onClick={() => setCheckoutOpen(true)} className="rounded-xl bg-[#1C1613] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#332923] disabled:cursor-not-allowed disabled:opacity-40">
                  Thanh toán
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#A69B93]">Miễn phí tư vấn và hỗ trợ xác nhận đơn hàng</p>
              {!items.length && (
                <Link href="/san-pham" onClick={closeAll} className="mt-2 block text-center text-xs font-bold text-[#D97706]">
                  Xem sản phẩm
                </Link>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}