import { NextResponse } from "next/server";
import { AFFILIATE_COOKIE } from "../../../lib/affiliate";
import { prisma } from "../../../lib/prisma";

type Params = Promise<{ code: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { code } = await params;
  const affiliate = await prisma.user.findUnique({ where: { affiliateCode: code }, select: { id: true } });
  const response = NextResponse.redirect(new URL("/san-pham", request.url));
  if (affiliate) {
    response.cookies.set(AFFILIATE_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return response;
}
