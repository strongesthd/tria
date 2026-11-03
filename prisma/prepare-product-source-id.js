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

    await transaction.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "affiliateCode" TEXT
    `;

    await transaction.$executeRaw`
      UPDATE "User"
      SET "affiliateCode" = 'TRIA-' || "id"
      WHERE "affiliateCode" IS NULL
    `;

    await transaction.$executeRaw`
      WITH duplicate_codes AS (
        SELECT "affiliateCode"
        FROM "User"
        WHERE "affiliateCode" IS NOT NULL
        GROUP BY "affiliateCode"
        HAVING COUNT(*) > 1
      ),
      duplicates_to_update AS (
        SELECT u."id", ROW_NUMBER() OVER (
          PARTITION BY u."affiliateCode"
          ORDER BY u."id"
        ) AS duplicate_number
        FROM "User" u
        JOIN duplicate_codes d ON d."affiliateCode" = u."affiliateCode"
      )
      UPDATE "User" u
      SET "affiliateCode" = 'TRIA-' || u."id"
      FROM duplicates_to_update d
      WHERE u."id" = d."id" AND d.duplicate_number > 1
    `;

    const affiliateDuplicates = await transaction.$queryRaw`
      SELECT "affiliateCode", COUNT(*)::int AS count
      FROM "User"
      WHERE "affiliateCode" IS NOT NULL
      GROUP BY "affiliateCode"
      HAVING COUNT(*) > 1
      LIMIT 10
    `;

    if (affiliateDuplicates.length > 0) {
      throw new Error(
        "Cannot add the User.affiliateCode unique constraint: duplicate affiliate codes remain after automatic repair.",
      );
    }

    const affiliateConstraint = await transaction.$queryRaw`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'User_affiliateCode_key'
        AND conrelid = '"User"'::regclass
      LIMIT 1
    `;

    if (affiliateConstraint.length === 0) {
      await transaction.$executeRaw`
        ALTER TABLE "User"
        ADD CONSTRAINT "User_affiliateCode_key" UNIQUE ("affiliateCode")
      `;
    }
  }, { maxWait: 60_000, timeout: 60_000 });

  console.log("Product.sourceId and User.affiliateCode are ready for Prisma schema sync.");
} finally {
  await prisma.$disconnect();
}
