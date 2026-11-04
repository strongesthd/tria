import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { parseProductPriceOptionsInput } from "../../../../lib/product-pricing";
import { sanitizeContentHtml } from "../../../../lib/sanitize-content";

function toSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

type ProductPayload = { name: string; category: string; target: string; price: number; unit: string; priceOptions: string; accessoryIds?: string[]; roastLevel: string; technicalSpecs?: string; notes: string; description: string; image: string; images?: string[] };
const adminProductSelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  target: true,
  price: true,
  unit: true,
  priceOptions: true,
  accessoryIds: true,
  roastLevel: true,
  notes: true,
  description: true,
  image: true,
  images: true,
  active: true,
} as const;

async function validatePayload(data: ProductPayload) {
  const slug = toSlug(data.name);
  if (!slug || !data.name || !data.category || !data.target || !Number.isSafeInteger(data.price) || data.price < 1 || !data.unit || !data.image) {
    throw new Error("Vui lòng nhập đầy đủ thông tin sản phẩm.");
  }
  if (data.category === "beans" && !["Rang nhạt", "Rang vừa", "Rang đậm"].includes(data.roastLevel)) {
    throw new Error("Vui lòng chọn mức rang hợp lệ.");
  }
  const accessoryIds = data.category === "machines" ? [...new Set(data.accessoryIds || [])] : [];
  if (accessoryIds.length > 12 || accessoryIds.some((id) => typeof id !== "string" || !id)) throw new Error("Danh sách phụ kiện không hợp lệ.");
  if (accessoryIds.length) {
    const accessories = await prisma.product.count({ where: { id: { in: accessoryIds }, category: "accessories", active: true } });
    if (accessories !== accessoryIds.length) throw new Error("Một hoặc nhiều phụ kiện không còn kinh doanh.");
  }
  const technicalSpecs = sanitizeContentHtml(data.technicalSpecs || "");
  return { ...data, slug, accessoryIds, technicalSpecs, notes: sanitizeContentHtml(data.notes || ""), description: sanitizeContentHtml(data.description || ""), priceOptions: parseProductPriceOptionsInput(data.priceOptions || "", data.unit, data.price, data.category) };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
    const q = url.searchParams.get("q")?.trim() || "";
    const category = url.searchParams.get("category")?.trim() || "";
    const sort = url.searchParams.get("sort") === "price" ? { price: "desc" as const } : { createdAt: "desc" as const };
    const where = {
      ...(category ? { category } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }, { category: { contains: q, mode: "insensitive" as const } }] } : {}),
    };
    const [total, items] = await Promise.all([prisma.product.count({ where }), prisma.product.findMany({ where, orderBy: sort, skip: (page - 1) * pageSize, take: pageSize, select: adminProductSelect })]);
    return NextResponse.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    console.error("[admin-products] Could not load products with technical specs.", error);
    return NextResponse.json({ error: "Không thể tải danh sách sản phẩm. Cơ sở dữ liệu chưa đồng bộ trường thông số kỹ thuật." }, { status: 503 });
  }
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) throw new Error("Bạn không có quyền quản trị.");
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await validatePayload(await request.json() as ProductPayload);
    const duplicate = await prisma.product.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "Tên sản phẩm đã tồn tại, slug bị trùng." }, { status: 409 });
    const product = await prisma.product.create({ data: { ...data, priceOptions: data.priceOptions ?? Prisma.DbNull }, select: adminProductSelect });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[admin-products] Could not create product.", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể lưu sản phẩm." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json() as ProductPayload & { id?: string };
    const { id, ...payload } = body;
    if (!id) return NextResponse.json({ error: "Thiếu mã sản phẩm." }, { status: 400 });
    const data = await validatePayload(payload);
    const duplicate = await prisma.product.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "Tên sản phẩm đã tồn tại, slug bị trùng." }, { status: 409 });
    const product = await prisma.product.update({ where: { id }, data: { ...data, priceOptions: data.priceOptions ?? Prisma.DbNull }, select: adminProductSelect });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("[admin-products] Could not update product.", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể lưu sản phẩm." }, { status: 400 });
  }
}
