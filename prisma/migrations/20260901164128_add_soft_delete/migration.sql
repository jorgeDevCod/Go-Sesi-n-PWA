-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "categories_userId_deletedAt_idx" ON "categories"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "subcategories_userId_deletedAt_idx" ON "subcategories"("userId", "deletedAt");
