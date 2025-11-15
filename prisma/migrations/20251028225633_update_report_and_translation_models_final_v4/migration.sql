-- AlterTable
ALTER TABLE "public"."report_translations" ADD COLUMN     "key_players" TEXT[] DEFAULT ARRAY[]::TEXT[];
