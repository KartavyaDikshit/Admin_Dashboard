-- AlterTable
ALTER TABLE "public"."content_generation_workflows" ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."report_translations" ADD COLUMN     "competitive_analysis_image_url" VARCHAR(500),
ADD COLUMN     "final_synthesis_image_url" VARCHAR(500),
ADD COLUMN     "market_analysis_image_url" VARCHAR(500),
ADD COLUMN     "trends_analysis_image_url" VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."reports" ADD COLUMN     "competitive_analysis_image_url" VARCHAR(500),
ADD COLUMN     "final_synthesis_image_url" VARCHAR(500),
ADD COLUMN     "market_analysis_image_url" VARCHAR(500),
ADD COLUMN     "trends_analysis_image_url" VARCHAR(500);
