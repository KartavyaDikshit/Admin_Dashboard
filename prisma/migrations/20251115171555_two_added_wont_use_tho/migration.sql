-- AlterTable
ALTER TABLE "public"."category_translations" ADD COLUMN     "ai_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "human_reviewed" BOOLEAN NOT NULL DEFAULT false;
