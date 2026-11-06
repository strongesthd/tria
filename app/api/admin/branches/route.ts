import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

type BranchPayload = {
  name?: unknown;
  address?: unknown;
  hours?: unknown;
  phone?: unknown;
  features?: unknown;
  image?: unknown;
  images?: unknown;
};

function parseBranchPayload(value: BranchPayload) {
  const { name, address, hours, phone, features, image, images = [] } = value;
  if (
    typeof name !== "string" || !name.trim()
    || typeof address !== "string" || !address.trim()
    || typeof hours !== "string" || !hours.trim()
    || typeof phone !== "string" || !phone.trim()
    || typeof image !== "string" || !image.trim()
    || !Array.isArray(features) || !features.every((item) => typeof item === "string")
    || !Array.isArray(images) || !images.every((item) => typeof item === "string")
  ) {
    throw new Error("Vui lòng nhập đầy đủ thông tin cơ sở.");
  }

  const dataImages = [image, ...images].filter((item) => item.startsWith("data:"));
  if (dataImages.some((item) => !/^data:image\/(jpeg|png|webp|gif);base64,/.test(item))) {
    throw new Error("Định dạng ảnh không hợp lệ.");
  }
  if (dataImages.some((item) => item.length > 7_000_000) || dataImages.reduce((size, item) => size + item.length, 0) > 9_000_000) {
    throw new Error("Tổng dung lượng ảnh upload vượt giới hạn. Hãy chọn ít ảnh hơn.");
  }

  const slug = name.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Tên cơ sở không tạo được slug hợp lệ.");

  return {
    name: name.trim(),
    slug,
    address: address.trim(),
    hours: hours.trim(),
    phone: phone.trim(),
    features: features.map((item) => item.trim()).filter(Boolean),
    image: image.trim(),
    images: images.map((item) => item.trim()).filter(Boolean),
  };
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === Role.ADMIN;
}

function revalidateBranchPages() {
  revalidateTag("site-footer");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/he-thong-quan");
}

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
  const q = url.searchParams.get("q")?.trim() || "";
  const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { address: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] } : {};
  const [total, items] = await Promise.all([prisma.branch.count({ where }), prisma.branch.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })]);
  return NextResponse.json({ items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Bạn không có quyền quản trị." }, { status: 403 });
  try {
    const data = parseBranchPayload(await request.json() as BranchPayload);
    const duplicate = await prisma.branch.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "Tên cơ sở đã tồn tại, slug bị trùng." }, { status: 409 });
    const branch = await prisma.branch.create({ data });
    revalidateBranchPages();
    return NextResponse.json({ branch }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Tên cơ sở đã tồn tại, slug bị trùng." }, { status: 409 });
    }
    if (error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[admin-branches] Could not create branch.", error);
    return NextResponse.json({ error: "Không thể lưu cơ sở. Vui lòng thử lại." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Bạn không có quyền quản trị." }, { status: 403 });
  try {
    const body = await request.json() as BranchPayload & { id?: unknown; active?: unknown };
    if (typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json({ error: "Thiếu mã cơ sở." }, { status: 400 });
    }
    if (typeof body.active === "boolean") {
      const branch = await prisma.branch.update({
        where: { id: body.id },
        data: { active: body.active },
      });
      revalidateBranchPages();
      return NextResponse.json({ branch });
    }

    const data = parseBranchPayload(body);
    const duplicate = await prisma.branch.findFirst({
      where: { slug: data.slug, NOT: { id: body.id } },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: "Tên cơ sở đã tồn tại, slug bị trùng." }, { status: 409 });
    const branch = await prisma.branch.update({ where: { id: body.id }, data });
    revalidateBranchPages();
    return NextResponse.json({ branch });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return NextResponse.json({ error: "Tên cơ sở đã tồn tại, slug bị trùng." }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Không tìm thấy cơ sở." }, { status: 404 });
    }
    if (error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[admin-branches] Could not update branch.", error);
    return NextResponse.json({ error: "Không thể cập nhật cơ sở. Vui lòng thử lại." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Bạn không có quyền quản trị." }, { status: 403 });
  try {
    const body = await request.json() as { id?: unknown };
    if (typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json({ error: "Thiếu mã cơ sở." }, { status: 400 });
    }
    await prisma.branch.delete({ where: { id: body.id } });
    revalidateBranchPages();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy cơ sở." }, { status: 404 });
    }
    console.error("[admin-branches] Could not delete branch.", error);
    return NextResponse.json({ error: "Không thể xóa cơ sở. Vui lòng thử lại." }, { status: 500 });
  }
}
