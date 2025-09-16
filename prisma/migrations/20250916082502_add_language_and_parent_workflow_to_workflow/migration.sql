-- AlterTable
ALTER TABLE "public"."content_generation_workflows" ADD COLUMN     "language" VARCHAR(10) NOT NULL DEFAULT 'en',
ADD COLUMN     "parent_workflow_id" UUID,
ADD COLUMN     "phase5_job_id" UUID,
ADD COLUMN     "target_languages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "public"."content_generation_workflows" ADD CONSTRAINT "content_generation_workflows_parent_workflow_id_fkey" FOREIGN KEY ("parent_workflow_id") REFERENCES "public"."content_generation_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
