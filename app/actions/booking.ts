"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { bookingSchema } from "../../lib/validation";

export type BookingState = { success?: string; error?: string };

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập để đặt lịch." };

  const parsed = bookingSchema.safeParse({
    locationId: formData.get("locationId"),
    bookingType: formData.get("bookingType"),
    date: formData.get("date"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  // Persist booking in DB for later follow-up.
  // `booking` is declared via module augmentation in types/prisma.d.ts because the
  // generated Prisma client predates the Booking model.
  await prisma.booking.create({
    data: {
      userId: session.user.id,
      locationId: parsed.data.locationId,
      type: parsed.data.bookingType,
      date: new Date(parsed.data.date),
      note: parsed.data.note ?? null,
    },
  });

  return { success: "Đăng Ký Thành Công! Chuyên viên tư vấn sẽ liên hệ xác nhận lịch hẹn trong vòng 30 phút." };
}
