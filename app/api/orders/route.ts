import { NextResponse } from "next/server";
import { auth } from "../../../auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt hàng." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const cartItems = Array.isArray(body.items) ? body.items : [];
    if (!cartItems.length) return NextResponse.json({ error: "Giỏ hàng trống." }, { status: 400 });

    // Future: attach the order to session.user.id and write order rows.
    // For now the UI only confirms receipt.
    return NextResponse.json(
      { ok: true, message: "Đã tiếp nhận đơn hàng.", orderId: crypto.randomUUID() },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}
