/*
  Warnings:

  - You are about to drop the `PlatformOwner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PlatformOwner";

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
