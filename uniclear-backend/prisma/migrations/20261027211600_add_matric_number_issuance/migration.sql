-- AlterTable
ALTER TABLE "ClearanceCampaign" ADD COLUMN "issuesMatricNumber" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClearanceCampaign" ADD COLUMN "matricPrefix" TEXT;
