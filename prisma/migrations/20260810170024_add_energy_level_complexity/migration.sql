-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "energyComplexity" "Complexity",
ADD COLUMN     "energyLevel" TEXT;

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "energyComplexity" "Complexity",
ADD COLUMN     "energyLevel" TEXT;
