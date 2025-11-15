/*
  Warnings:

  - You are about to drop the column `competitive_analysis_image_url` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `final_synthesis_image_url` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `key_players` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `market_analysis_image_url` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `trends_analysis_image_url` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `competitive_analysis_image_url` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `final_synthesis_image_url` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `market_analysis_image_url` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `trends_analysis_image_url` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."report_translations" DROP COLUMN "competitive_analysis_image_url",
DROP COLUMN "final_synthesis_image_url",
DROP COLUMN "key_players",
DROP COLUMN "market_analysis_image_url",
DROP COLUMN "trends_analysis_image_url",
ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."reports" DROP COLUMN "competitive_analysis_image_url",
DROP COLUMN "final_synthesis_image_url",
DROP COLUMN "market_analysis_image_url",
DROP COLUMN "trends_analysis_image_url",
ADD COLUMN     "image_url" VARCHAR(500);
