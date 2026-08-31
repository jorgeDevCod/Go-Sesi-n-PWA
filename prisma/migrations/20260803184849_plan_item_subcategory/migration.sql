-- AlterTable
ALTER TABLE "plan_items" ADD COLUMN     "subcategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "plan_items" ADD CONSTRAINT "plan_items_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
