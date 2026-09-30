import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { clientIp, rateLimit } from "../../../lib/rate-limit";
import { fieldErrors, partnershipLeadSchema } from "../../../lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(`partnership:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsed = partnershipLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vui lòng kiểm tra lại thông tin.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }

  await prisma.partnershipLead.create({ data: parsed.data });
  return NextResponse.json({ ok: true, message: "Đã nhận thông tin hợp tác." }, { status: 201 });
}
