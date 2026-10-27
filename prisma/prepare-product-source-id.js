import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceId" TEXT
    `;

    const duplicates = await transaction.$queryRaw`
      SELECT "sourceId", COUNT(*)::int AS count
      FROM "Product"
      WHERE "sourceId" IS NOT NULL
      GROUP BY "sourceId"
      HAVING COUNT(*) > 1
      LIMIT 10
    `;

    if (duplicates.length > 0) {
      throw new Error(
        "Cannot add the Product.sourceId unique constraint: duplicate non-null sourceId values already exist. Resolve the duplicates without deleting products, then redeploy.",
      );
    }

    const constraints = await transaction.$queryRaw`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'Product_sourceId_key'
        AND conrelid = '"Product"'::regclass
      LIMIT 1
    `;

    if (constraints.length === 0) {
      await transaction.$executeRaw`
        ALTER TABLE "Product"
        ADD CONSTRAINT "Product_sourceId_key" UNIQUE ("sourceId")
      `;
    }
  }, { maxWait: 60_000, timeout: 60_000 });

  console.log("Product.sourceId is ready for Prisma schema sync.");
} finally {
  await prisma.$disconnect();
}
