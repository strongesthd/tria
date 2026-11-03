import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { checkoutSchema } from "../../../lib/validation";
import { getCartProductPrice } from "../../../lib/product-pricing";
import { AFFILIATE_COOKIE, AFFILIATE_COMMISSION_RATES } from "../../../lib/affiliate";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt hàng." }, { status: 401 });
  }
  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Thông tin đặt hàng không hợp lệ." }, { status: 422 });
    const ids = [...new Set(parsed.data.items.flatMap((item) => {
      const baseId = item.id.split("-")[0];
      const bundleMarker = `${baseId}-bundle-`;
      const accessoryIds = item.id.startsWith(bundleMarker) ? item.id.slice(bundleMarker.length).split(",").filter(Boolean) : [];
      return [baseId, ...accessoryIds];
    }))];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    const productMap = new Map(products.map((product) => [product.id, product]));
    const items = parsed.data.items.map((item) => {
      const product = productMap.get(item.id.split("-")[0]);
      if (!product) throw new Error("Sản phẩm không tồn tại.");
      const selectedPrice = getCartProductPrice(product, item.id, products);
      if (!selectedPrice) throw new Error("Tùy chọn sản phẩm không hợp lệ.");
      return {
        productId: product.id,
        category: product.category,
        name: selectedPrice.unit ? `${product.name} · ${selectedPrice.unit}` : product.name,
        unitPrice: selectedPrice.price,
        quantity: item.quantity,
      };
    });
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const affiliateCode = (await cookies()).get(AFFILIATE_COOKIE)?.value;
    const affiliate = affiliateCode
      ? await prisma.user.findUnique({ where: { affiliateCode }, select: { id: true } })
      : null;
    const affiliateUserId = affiliate && affiliate.id !== session.user.id ? affiliate.id : null;
    const commission = affiliateUserId
      ? items.reduce((sum, item) => sum + Math.round(item.unitPrice * item.quantity * (AFFILIATE_COMMISSION_RATES[item.category] || 0) / 100), 0)
      : 0;
    const commissionRate = total ? Math.round((commission / total) * 10000) / 100 : 0;
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        affiliateUserId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
        ...(affiliateUserId ? { affiliateSale: { create: { affiliateUserId, revenue: total, commissionRate, commission } } } : {}),
      },
      select: { id: true, total: true },
    });
    return NextResponse.json({ ok: true, message: "Đã tiếp nhận đơn hàng.", orderId: order.id, total: order.total }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại." }, { status: 400 });
  }
}
