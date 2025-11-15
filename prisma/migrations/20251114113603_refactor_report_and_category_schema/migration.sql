/*
  Warnings:

  - You are about to drop the column `description_de` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_en` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_es` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_fr` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_it` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_ja` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description_ko` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_de` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_en` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_es` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_fr` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_it` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_ja` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `title_ko` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `final_synthesis` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `section_1` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `section_2` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `section_3` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `section_4` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `strategic_developments` on the `report_translations` table. All the data in the column will be lost.
  - You are about to drop the column `ai_confidence_score` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `content_generation_workflow_id` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `content_quality_score` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `final_synthesis` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `human_approved` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `is_section_1_edited` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `is_section_2_edited` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `is_section_3_edited` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `is_section_4_edited` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `is_toc_edited` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `section_1` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `section_2` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `section_3` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `section_4` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `strategic_developments` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the `ai_prompt_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_report_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_generation_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_generation_workflows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ai_prompt_results" DROP CONSTRAINT "ai_prompt_results_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_generation_jobs" DROP CONSTRAINT "content_generation_jobs_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_generation_workflows" DROP CONSTRAINT "content_generation_workflows_parent_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_content_generation_workflow_id_fkey";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "description_de",
DROP COLUMN "description_en",
DROP COLUMN "description_es",
DROP COLUMN "description_fr",
DROP COLUMN "description_it",
DROP COLUMN "description_ja",
DROP COLUMN "description_ko",
DROP COLUMN "title_de",
DROP COLUMN "title_en",
DROP COLUMN "title_es",
DROP COLUMN "title_fr",
DROP COLUMN "title_it",
DROP COLUMN "title_ja",
DROP COLUMN "title_ko",
ADD COLUMN     "name" VARCHAR(300) NOT NULL DEFAULT 'Untitled';

-- AlterTable
ALTER TABLE "public"."report_translations" DROP COLUMN "final_synthesis",
DROP COLUMN "section_1",
DROP COLUMN "section_2",
DROP COLUMN "section_3",
DROP COLUMN "section_4",
DROP COLUMN "strategic_developments",
ADD COLUMN     "key_market_players" TEXT,
ADD COLUMN     "market_dynamics" TEXT,
ADD COLUMN     "market_research_summary" TEXT,
ADD COLUMN     "regional_insights" TEXT;

-- AlterTable
ALTER TABLE "public"."reports" DROP COLUMN "ai_confidence_score",
DROP COLUMN "content_generation_workflow_id",
DROP COLUMN "content_quality_score",
DROP COLUMN "final_synthesis",
DROP COLUMN "human_approved",
DROP COLUMN "is_section_1_edited",
DROP COLUMN "is_section_2_edited",
DROP COLUMN "is_section_3_edited",
DROP COLUMN "is_section_4_edited",
DROP COLUMN "is_toc_edited",
DROP COLUMN "section_1",
DROP COLUMN "section_2",
DROP COLUMN "section_3",
DROP COLUMN "section_4",
DROP COLUMN "strategic_developments",
ADD COLUMN     "key_market_players" TEXT,
ADD COLUMN     "market_dynamics" TEXT,
ADD COLUMN     "market_research_summary" TEXT,
ADD COLUMN     "regional_insights" TEXT;

-- DropTable
DROP TABLE "public"."ai_prompt_results";

-- DropTable
DROP TABLE "public"."ai_report_sessions";

-- DropTable
DROP TABLE "public"."content_generation_jobs";

-- DropTable
DROP TABLE "public"."content_generation_workflows";
