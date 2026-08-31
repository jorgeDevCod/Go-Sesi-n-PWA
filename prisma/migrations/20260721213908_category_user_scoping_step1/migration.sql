-- DropIndex
DROP INDEX "categories_key_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "key" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "categories_userId_order_idx" ON "categories"("userId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "categories_userId_key_key" ON "categories"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_userId_name_key" ON "categories"("userId", "name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
