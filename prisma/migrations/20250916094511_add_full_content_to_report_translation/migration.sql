-- AlterTable
ALTER TABLE "public"."report_translations" ADD COLUMN     "competitive_analysis" TEXT,
ADD COLUMN     "final_synthesis" TEXT,
ADD COLUMN     "key_players" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "market_analysis" TEXT,
ADD COLUMN     "strategic_developments" TEXT,
ADD COLUMN     "trends_analysis" TEXT;
