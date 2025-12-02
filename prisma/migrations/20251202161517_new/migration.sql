/*
  Warnings:

  - The primary key for the `_CategoryToReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_CategoryToReport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[report_id]` on the table `reports` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_CategoryToReport" DROP CONSTRAINT "_CategoryToReport_AB_pkey";

-- AlterTable
ALTER TABLE "report_translations" ADD COLUMN     "title_description" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "report_id" VARCHAR(20),
ADD COLUMN     "title_description" TEXT,
ALTER COLUMN "single_price" SET DEFAULT 4700,
ALTER COLUMN "multi_price" SET DEFAULT 6899,
ALTER COLUMN "corporate_price" SET DEFAULT 8499;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "image" VARCHAR(500);

-- CreateTable
CREATE TABLE "press_releases" (
    "id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "press_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "press_release_translations" (
    "id" UUID NOT NULL,
    "press_release_id" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "press_release_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToPressRelease" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "press_releases_slug_key" ON "press_releases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "press_release_translations_press_release_id_locale_key" ON "press_release_translations"("press_release_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPressRelease_AB_unique" ON "_CategoryToPressRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPressRelease_B_index" ON "_CategoryToPressRelease"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToReport_AB_unique" ON "_CategoryToReport"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "reports_report_id_key" ON "reports"("report_id");

-- AddForeignKey
ALTER TABLE "press_release_translations" ADD CONSTRAINT "press_release_translations_press_release_id_fkey" FOREIGN KEY ("press_release_id") REFERENCES "press_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPressRelease" ADD CONSTRAINT "_CategoryToPressRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPressRelease" ADD CONSTRAINT "_CategoryToPressRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "press_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
