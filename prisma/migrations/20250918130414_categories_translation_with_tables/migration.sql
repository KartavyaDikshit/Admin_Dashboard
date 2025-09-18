/*
  Warnings:

  - You are about to drop the column `meta_description_de` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_es` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_fr` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_it` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_ja` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description_ko` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_de` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_es` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_fr` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_it` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_ja` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title_ko` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_de` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_es` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_fr` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_it` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_ja` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keywords_ko` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "meta_description_de",
DROP COLUMN "meta_description_es",
DROP COLUMN "meta_description_fr",
DROP COLUMN "meta_description_it",
DROP COLUMN "meta_description_ja",
DROP COLUMN "meta_description_ko",
DROP COLUMN "meta_title_de",
DROP COLUMN "meta_title_es",
DROP COLUMN "meta_title_fr",
DROP COLUMN "meta_title_it",
DROP COLUMN "meta_title_ja",
DROP COLUMN "meta_title_ko",
DROP COLUMN "seo_keywords_de",
DROP COLUMN "seo_keywords_es",
DROP COLUMN "seo_keywords_fr",
DROP COLUMN "seo_keywords_it",
DROP COLUMN "seo_keywords_ja",
DROP COLUMN "seo_keywords_ko";
