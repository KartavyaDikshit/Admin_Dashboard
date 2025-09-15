-- CreateTable
CREATE TABLE "public"."testimonials" (
    "id" UUID NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "position" VARCHAR(255),
    "content" TEXT NOT NULL,
    "rating" SMALLINT DEFAULT 5,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);
