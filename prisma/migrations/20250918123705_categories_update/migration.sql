/*
  Warnings:

  - You are about to drop the column `description` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the `category_translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."category_translations" DROP CONSTRAINT "category_translations_category_id_fkey";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "description_de" TEXT,
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_es" TEXT,
ADD COLUMN     "description_fr" TEXT,
ADD COLUMN     "description_it" TEXT,
ADD COLUMN     "description_ja" TEXT,
ADD COLUMN     "description_ko" TEXT,
ADD COLUMN     "title_de" VARCHAR(300),
ADD COLUMN     "title_en" VARCHAR(300),
ADD COLUMN     "title_es" VARCHAR(300),
ADD COLUMN     "title_fr" VARCHAR(300),
ADD COLUMN     "title_it" VARCHAR(300),
ADD COLUMN     "title_ja" VARCHAR(300),
ADD COLUMN     "title_ko" VARCHAR(300);

-- DropTable
DROP TABLE "public"."category_translations";
