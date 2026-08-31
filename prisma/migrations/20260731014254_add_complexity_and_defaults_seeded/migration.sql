-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "complexity" "Complexity" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultsSeeded" BOOLEAN NOT NULL DEFAULT false;
