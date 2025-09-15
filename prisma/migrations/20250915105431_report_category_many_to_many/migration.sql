/*
  Warnings:

  - You are about to drop the column `category_id` on the `reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_category_id_fkey";

-- AlterTable
ALTER TABLE "public"."reports" DROP COLUMN "category_id";

-- CreateTable
CREATE TABLE "public"."_CategoryToReport" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToReport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToReport_B_index" ON "public"."_CategoryToReport"("B");

-- AddForeignKey
ALTER TABLE "public"."_CategoryToReport" ADD CONSTRAINT "_CategoryToReport_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryToReport" ADD CONSTRAINT "_CategoryToReport_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
