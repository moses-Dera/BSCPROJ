/*
  Warnings:

  - You are about to drop the column `stageId` on the `Officer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stageId,documentTypeId,facultyId,departmentId,sessionId,level]` on the table `StageDocumentRequirement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[universityId,jambRegNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webhookSecret]` on the table `University` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jambRegNo` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StageScope" AS ENUM ('UNIVERSITY', 'FACULTY', 'DEPARTMENT');

-- DropForeignKey
ALTER TABLE "Officer" DROP CONSTRAINT "Officer_stageId_fkey";

-- DropIndex
DROP INDEX "StageDocumentRequirement_stageId_documentTypeId_key";

-- AlterTable
ALTER TABLE "ClearanceRequest" ADD COLUMN     "stageStatus" "StageStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ClearanceStage" ADD COLUMN     "scope" "StageScope" NOT NULL DEFAULT 'UNIVERSITY';

-- AlterTable
ALTER TABLE "Officer" DROP COLUMN "stageId";

-- AlterTable
ALTER TABLE "StageApproval" ADD COLUMN     "attachmentKey" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;

-- AlterTable
ALTER TABLE "StageDocumentRequirement" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "entrySessionId" TEXT,
ADD COLUMN     "entryYear" TEXT,
ADD COLUMN     "jambRegNo" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "matricNo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "webhookSecret" TEXT;

-- CreateTable
CREATE TABLE "StageOfficerAssignment" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "facultyId" TEXT,
    "departmentId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageOfficerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficerStamp" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficerStamp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StageOfficerAssignment_universityId_idx" ON "StageOfficerAssignment"("universityId");

-- CreateIndex
CREATE INDEX "StageOfficerAssignment_stageId_idx" ON "StageOfficerAssignment"("stageId");

-- CreateIndex
CREATE INDEX "StageOfficerAssignment_officerId_idx" ON "StageOfficerAssignment"("officerId");

-- CreateIndex
CREATE UNIQUE INDEX "StageOfficerAssignment_stageId_officerId_facultyId_departme_key" ON "StageOfficerAssignment"("stageId", "officerId", "facultyId", "departmentId", "sessionId");

-- CreateIndex
CREATE INDEX "OfficerStamp_universityId_idx" ON "OfficerStamp"("universityId");

-- CreateIndex
CREATE INDEX "OfficerStamp_officerId_idx" ON "OfficerStamp"("officerId");

-- CreateIndex
CREATE UNIQUE INDEX "StageDocumentRequirement_stageId_documentTypeId_facultyId_d_key" ON "StageDocumentRequirement"("stageId", "documentTypeId", "facultyId", "departmentId", "sessionId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "Student_universityId_jambRegNo_key" ON "Student"("universityId", "jambRegNo");

-- CreateIndex
CREATE UNIQUE INDEX "University_webhookSecret_key" ON "University"("webhookSecret");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_entrySessionId_fkey" FOREIGN KEY ("entrySessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageOfficerAssignment" ADD CONSTRAINT "StageOfficerAssignment_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ClearanceStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageOfficerAssignment" ADD CONSTRAINT "StageOfficerAssignment_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageOfficerAssignment" ADD CONSTRAINT "StageOfficerAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageOfficerAssignment" ADD CONSTRAINT "StageOfficerAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageOfficerAssignment" ADD CONSTRAINT "StageOfficerAssignment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageDocumentRequirement" ADD CONSTRAINT "StageDocumentRequirement_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageDocumentRequirement" ADD CONSTRAINT "StageDocumentRequirement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageDocumentRequirement" ADD CONSTRAINT "StageDocumentRequirement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerStamp" ADD CONSTRAINT "OfficerStamp_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerStamp" ADD CONSTRAINT "OfficerStamp_user_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerStamp" ADD CONSTRAINT "OfficerStamp_officer_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
