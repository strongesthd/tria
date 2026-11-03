import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, slug, name, category, target, price, unit, "priceOptions",
        "accessoryIds", "roastLevel", "technicalSpecs", notes, description,
        image, images, active
      FROM "Product"
      WHERE id = ${id}
      LIMIT 1
    `;
    const product = rows[0];
    if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("[admin-product] Could not load product detail.", error);
    return NextResponse.json({ error: "Không thể tải dữ liệu sản phẩm." }, { status: 503 });
  }
}
