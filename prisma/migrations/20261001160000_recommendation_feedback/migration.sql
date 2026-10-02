-- CreateTable
CREATE TABLE "recommendation_feedbacks" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,

    CONSTRAINT "recommendation_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_feedbacks_userId_subcategoryId_key" ON "recommendation_feedbacks"("userId", "subcategoryId");

-- AddForeignKey
ALTER TABLE "recommendation_feedbacks" ADD CONSTRAINT "recommendation_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedbacks" ADD CONSTRAINT "recommendation_feedbacks_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
