-- AlterTable
ALTER TABLE "public"."content_generation_workflows" ADD COLUMN     "total_input_tokens_used" INTEGER DEFAULT 0,
ADD COLUMN     "total_output_tokens_used" INTEGER DEFAULT 0,
ALTER COLUMN "total_tokens_used" DROP NOT NULL,
ALTER COLUMN "total_cost" DROP NOT NULL;
