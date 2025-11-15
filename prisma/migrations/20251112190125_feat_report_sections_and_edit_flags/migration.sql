/*
  Warnings:

  - You are about to drop the column `competitive_analysis` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `is_edited` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `market_analysis` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `trends_analysis` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `competitive_analysis` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `market_analysis` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `trends_analysis` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."report_translations" DROP COLUMN "competitive_analysis",
DROP COLUMN "is_edited",
DROP COLUMN "market_analysis",
DROP COLUMN "trends_analysis",
ADD COLUMN     "section_1" TEXT,
ADD COLUMN     "section_2" TEXT,
ADD COLUMN     "section_3" TEXT,
ADD COLUMN     "section_4" TEXT;

-- AlterTable
ALTER TABLE "public"."reports" DROP COLUMN "competitive_analysis",
DROP COLUMN "market_analysis",
DROP COLUMN "trends_analysis",
ADD COLUMN     "is_section_1_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_section_2_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_section_3_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_section_4_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_toc_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "section_1" TEXT,
ADD COLUMN     "section_2" TEXT,
ADD COLUMN     "section_3" TEXT,
ADD COLUMN     "section_4" TEXT;
