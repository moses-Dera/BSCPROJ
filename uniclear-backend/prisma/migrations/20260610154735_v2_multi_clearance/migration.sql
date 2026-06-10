/*
  Warnings:

  - A unique constraint covering the columns `[studentId,sessionId,campaignId]` on the table `ClearanceRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `ClearanceRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `ClearanceStage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ClearanceRequest_studentId_sessionId_key";

-- DropIndex
DROP INDEX "ClearanceStage_universityId_orderIndex_idx";

-- AlterTable
ALTER TABLE "ClearanceRequest" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ClearanceStage" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ClearanceCampaign" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetFacultyId" TEXT,
    "targetDepartmentId" TEXT,
    "targetLevel" TEXT,
    "whitelistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whitelist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClearanceCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClearanceCampaign_universityId_idx" ON "ClearanceCampaign"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceRequest_studentId_sessionId_campaignId_key" ON "ClearanceRequest"("studentId", "sessionId", "campaignId");

-- CreateIndex
CREATE INDEX "ClearanceStage_universityId_campaignId_orderIndex_idx" ON "ClearanceStage"("universityId", "campaignId", "orderIndex");

-- AddForeignKey
ALTER TABLE "ClearanceCampaign" ADD CONSTRAINT "ClearanceCampaign_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceCampaign" ADD CONSTRAINT "ClearanceCampaign_targetFacultyId_fkey" FOREIGN KEY ("targetFacultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceCampaign" ADD CONSTRAINT "ClearanceCampaign_targetDepartmentId_fkey" FOREIGN KEY ("targetDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceStage" ADD CONSTRAINT "ClearanceStage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ClearanceCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ClearanceCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
