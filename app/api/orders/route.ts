import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { checkoutSchema } from "../../../lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt hàng." }, { status: 401 });
  }
  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Thông tin đặt hàng không hợp lệ." }, { status: 422 });
    const ids = parsed.data.items.map((item) => item.id.split("-")[0]);
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    const productMap = new Map(products.map((product) => [product.id, product]));
    const items = parsed.data.items.map((item) => {
      const product = productMap.get(item.id.split("-")[0]);
      if (!product) throw new Error("Sản phẩm không tồn tại.");
      return { productId: product.id, name: product.name, unitPrice: product.price, quantity: item.quantity };
    });
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const order = await prisma.order.create({ data: { userId: session.user.id, name: parsed.data.name, phone: parsed.data.phone, address: parsed.data.address, total, items: { create: items } }, select: { id: true, total: true } });
    return NextResponse.json({ ok: true, message: "Đã tiếp nhận đơn hàng.", orderId: order.id, total: order.total }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại." }, { status: 400 });
  }
}
