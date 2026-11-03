import { prisma } from "./prisma";

export const AFFILIATE_COOKIE = "tria-affiliate";
export const AFFILIATE_COMMISSION_RATES: Record<string, number> = {
  machines: 5,
  beans: 8,
  accessories: 5,
};

function createCode(name: string | null | undefined) {
  const prefix = (name || "tria")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase() || "TRIA";
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function ensureAffiliateCode(userId: string, name?: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { affiliateCode: true, name: true } });
  if (!user) throw new Error("Không tìm thấy tài khoản.");
  if (user.affiliateCode) return user.affiliateCode;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const affiliateCode = createCode(name || user.name);
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { affiliateCode },
        select: { affiliateCode: true },
      });
      return updated.affiliateCode as string;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  throw new Error("Không thể tạo mã affiliate.");
}

export function getAffiliateLink(code: string) {
  return `/gioi-thieu/${encodeURIComponent(code)}`;
}
