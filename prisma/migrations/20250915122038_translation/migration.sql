-- AlterTable
ALTER TABLE "public"."translation_jobs" ADD COLUMN     "batch_id" UUID;

-- CreateTable
CREATE TABLE "public"."translation_batches" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "public"."TranslationJobStatus" NOT NULL DEFAULT 'PENDING',
    "contentType" VARCHAR(50) NOT NULL,
    "targetLocales" TEXT[],
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_batches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."translation_jobs" ADD CONSTRAINT "translation_jobs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."translation_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
