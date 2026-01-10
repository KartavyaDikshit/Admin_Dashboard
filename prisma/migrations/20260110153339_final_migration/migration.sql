-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "image_alt" VARCHAR(255);

-- CreateTable
CREATE TABLE "customization_requests" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "report_title" VARCHAR(500) NOT NULL,
    "request_type" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100),
    "description" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "company" VARCHAR(200),
    "source_url" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customization_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "customization_requests" ADD CONSTRAINT "customization_requests_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
