import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { clientIp, rateLimit } from "../../../lib/rate-limit";
import { emailSchema, fieldErrors, nameSchema, phoneSchema } from "../../../lib/validation";
import { z } from "zod";

const messageSchema = z.object({ name: nameSchema, email: emailSchema.optional(), phone: phoneSchema.optional(), subject: z.string().trim().max(180).optional(), content: z.string().trim().min(1).max(5000) });

export async function POST(request: Request) {
  const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Bạn gửi quá nhiều yêu cầu." }, { status: 429 });
  try {
    const parsed = messageSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ.", fields: fieldErrors(parsed.error) }, { status: 422 });
    const session = await auth();
    const message = await prisma.contactMessage.create({ data: { ...parsed.data, userId: session?.user?.id } });
    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Không thể gửi tin nhắn." }, { status: 400 }); }
}
