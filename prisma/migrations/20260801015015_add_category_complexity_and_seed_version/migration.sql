-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "complexity" "Complexity" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "seedVersion" INTEGER NOT NULL DEFAULT 1;
