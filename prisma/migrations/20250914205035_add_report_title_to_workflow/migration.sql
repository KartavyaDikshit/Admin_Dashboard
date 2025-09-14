-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."TranslationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TranslationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRY');

-- CreateEnum
CREATE TYPE "public"."ContentWorkflowStatus" AS ENUM ('GENERATING', 'PENDING_REVIEW', 'IN_REVISION', 'REVISION_REQUIRED', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ContentJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('SUPERADMIN', 'MANAGER', 'EDITOR', 'TRANSLATOR', 'MODERATOR');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LicenseType" AS ENUM ('SINGLE', 'MULTIPLE', 'CORPORATE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'CLOSED_LOST', 'CLOSED_WON');

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" UUID NOT NULL,
    "shortcode" VARCHAR(20) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regional_keywords" JSONB,
    "search_volume" JSONB,
    "ranking_factors" JSONB,
    "meta_title" VARCHAR(300),
    "meta_description" VARCHAR(500),
    "canonical_url" VARCHAR(500),
    "og_title" VARCHAR(300),
    "og_description" VARCHAR(500),
    "og_image" VARCHAR(500),
    "hreflang_alts" JSONB,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "click_count" BIGINT NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_translations" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(150) NOT NULL,
    "seo_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localized_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cultural_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "long_tail_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" VARCHAR(300),
    "meta_description" VARCHAR(500),
    "og_title" VARCHAR(300),
    "og_description" VARCHAR(500),
    "translation_job_id" UUID,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "human_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "translation_quality" DECIMAL(3,2),
    "cultural_adaptation" TEXT,
    "search_performance" JSONB,
    "local_rankings" JSONB,
    "status" "public"."TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "sku" VARCHAR(50),
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "published_date" DATE NOT NULL,
    "base_year" INTEGER,
    "forecast_period" VARCHAR(50),
    "table_of_contents" TEXT,
    "list_of_figures" TEXT,
    "methodology" TEXT,
    "key_findings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "executive_summary" TEXT,
    "market_data" JSONB,
    "competitive_landscape" JSONB,
    "market_segmentation" JSONB,
    "regional_analysis" JSONB,
    "swot_analysis" JSONB,
    "key_players" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industry_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "report_type" VARCHAR(50),
    "research_method" VARCHAR(100),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "semantic_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regional_keywords" JSONB,
    "competitor_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trending_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "long_tail_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" VARCHAR(500) NOT NULL,
    "meta_description" VARCHAR(500) NOT NULL,
    "canonical_url" VARCHAR(500),
    "og_title" VARCHAR(500),
    "og_description" VARCHAR(500),
    "og_image" VARCHAR(500),
    "twitter_title" VARCHAR(500),
    "twitter_description" VARCHAR(500),
    "schema_markup" JSONB,
    "breadcrumb_data" JSONB,
    "faq_data" JSONB,
    "single_price" DECIMAL(10,2),
    "multi_price" DECIMAL(10,2),
    "corporate_price" DECIMAL(10,2),
    "enterprise_price" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "content_generation_workflow_id" UUID,
    "human_approved" BOOLEAN NOT NULL DEFAULT false,
    "content_quality_score" DECIMAL(3,2),
    "ai_confidence_score" DECIMAL(3,2),
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "download_count" BIGINT NOT NULL DEFAULT 0,
    "share_count" BIGINT NOT NULL DEFAULT 0,
    "enquiry_count" BIGINT NOT NULL DEFAULT 0,
    "search_rankings" JSONB,
    "click_through_rate" DECIMAL(5,4),
    "average_position" DECIMAL(5,2),
    "impressions" BIGINT NOT NULL DEFAULT 0,
    "clicks" BIGINT NOT NULL DEFAULT 0,
    "bounce_rate" DECIMAL(5,4),
    "time_on_page" INTEGER,
    "avg_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "total_rating_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_translations" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "slug" VARCHAR(200) NOT NULL,
    "table_of_contents" TEXT,
    "list_of_figures" TEXT,
    "methodology" TEXT,
    "key_findings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "executive_summary" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "semantic_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localized_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cultural_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "long_tail_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "local_competitor_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" VARCHAR(500) NOT NULL,
    "meta_description" VARCHAR(500) NOT NULL,
    "canonical_url" VARCHAR(500),
    "og_title" VARCHAR(500),
    "og_description" VARCHAR(500),
    "og_image" VARCHAR(500),
    "twitter_title" VARCHAR(500),
    "twitter_description" VARCHAR(500),
    "schema_markup" JSONB,
    "breadcrumb_data" JSONB,
    "faq_data" JSONB,
    "local_business_schema" JSONB,
    "translation_job_id" UUID,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "human_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "translation_quality" DECIMAL(3,2),
    "cultural_adaptation_score" DECIMAL(3,2),
    "cultural_adaptation_notes" TEXT,
    "localization_notes" TEXT,
    "search_performance" JSONB,
    "local_rankings" JSONB,
    "regional_ctr" DECIMAL(5,4),
    "regional_impressions" BIGINT NOT NULL DEFAULT 0,
    "regional_clicks" BIGINT NOT NULL DEFAULT 0,
    "status" "public"."TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_generation_workflows" (
    "id" UUID NOT NULL,
    "report_title" VARCHAR(500) NOT NULL,
    "industry" VARCHAR(255),
    "market_size" VARCHAR(255),
    "geographic_scope" VARCHAR(255),
    "timeframe" VARCHAR(50),
    "report_type" VARCHAR(50),
    "custom_requirements" TEXT,
    "phase1_job_id" UUID,
    "phase2_job_id" UUID,
    "phase3_job_id" UUID,
    "phase4_job_id" UUID,
    "market_analysis" TEXT,
    "competitive_analysis" TEXT,
    "trends_analysis" TEXT,
    "final_synthesis" TEXT,
    "overall_quality_score" DECIMAL(3,2),
    "content_coherence" DECIMAL(3,2),
    "factual_accuracy" DECIMAL(3,2),
    "market_insight_depth" DECIMAL(3,2),
    "innovation_score" DECIMAL(3,2),
    "workflow_status" "public"."ContentWorkflowStatus" NOT NULL DEFAULT 'GENERATING',
    "current_phase" INTEGER NOT NULL DEFAULT 1,
    "assigned_reviewer_id" UUID,
    "review_notes" TEXT,
    "revision_requests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "processing_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,

    CONSTRAINT "content_generation_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_generation_jobs" (
    "id" UUID NOT NULL,
    "workflow_id" UUID,
    "phase" INTEGER NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "context_data" JSONB,
    "ai_model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4-turbo-preview',
    "temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.4,
    "max_tokens" INTEGER NOT NULL DEFAULT 4000,
    "input_prompt" TEXT NOT NULL,
    "output_text" TEXT,
    "quality_score" DECIMAL(3,2),
    "relevance_score" DECIMAL(3,2),
    "innovation_score" DECIMAL(3,2),
    "completeness_score" DECIMAL(3,2),
    "status" "public"."ContentJobStatus" NOT NULL DEFAULT 'PENDING',
    "processing_time" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "cost" DECIMAL(8,4),
    "error_message" TEXT,
    "error_code" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."translation_jobs" (
    "id" UUID NOT NULL,
    "content_type" VARCHAR(50) NOT NULL,
    "content_id" UUID NOT NULL,
    "source_locale" VARCHAR(5) NOT NULL,
    "target_locale" VARCHAR(5) NOT NULL,
    "field_name" VARCHAR(50) NOT NULL,
    "original_text" TEXT NOT NULL,
    "translated_text" TEXT,
    "ai_model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4',
    "prompt_template" TEXT,
    "temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.3,
    "max_tokens" INTEGER NOT NULL DEFAULT 2000,
    "quality_score" DECIMAL(3,2),
    "fluency_score" DECIMAL(3,2),
    "accuracy_score" DECIMAL(3,2),
    "cultural_score" DECIMAL(3,2),
    "seo_relevance_score" DECIMAL(3,2),
    "status" "public"."TranslationJobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "estimated_cost" DECIMAL(8,4),
    "actual_cost" DECIMAL(8,4),
    "error_message" TEXT,
    "error_code" VARCHAR(50),
    "processing_started" TIMESTAMP(3),
    "processing_ended" TIMESTAMP(3),
    "processing_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "translation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_prompt_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "prompt_type" VARCHAR(50) NOT NULL,
    "phase" INTEGER,
    "template_text" TEXT NOT NULL,
    "variables" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "avg_quality_score" DECIMAL(3,2),
    "avg_cost" DECIMAL(8,4),
    "success_rate" DECIMAL(5,4),
    "default_model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4',
    "default_temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.3,
    "default_max_tokens" INTEGER NOT NULL DEFAULT 2000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,

    CONSTRAINT "ai_prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage_logs" (
    "id" UUID NOT NULL,
    "service_type" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "request_id" VARCHAR(100),
    "job_id" UUID,
    "user_id" UUID,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "cost_per_token" DECIMAL(10,8) NOT NULL,
    "total_cost" DECIMAL(8,4) NOT NULL,
    "response_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "request_data" JSONB,
    "response_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_quotas" (
    "id" UUID NOT NULL,
    "quota_type" VARCHAR(20) NOT NULL,
    "service_type" VARCHAR(50) NOT NULL,
    "quota_date" VARCHAR(10) NOT NULL,
    "tokens_limit" INTEGER NOT NULL,
    "requests_limit" INTEGER NOT NULL,
    "cost_limit" DECIMAL(10,2) NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "requests_made" INTEGER NOT NULL DEFAULT 0,
    "cost_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_exceeded" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone" VARCHAR(20),
    "company" VARCHAR(200),
    "country" VARCHAR(100),
    "preferred_language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "timezone" VARCHAR(50),
    "newsletter" BOOLEAN NOT NULL DEFAULT true,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "registration_source" VARCHAR(100),
    "utm_data" JSONB,
    "behavior_data" JSONB,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."AdminRole" NOT NULL,
    "permissions" JSONB,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "order_number" VARCHAR(50) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_name" VARCHAR(200) NOT NULL,
    "customer_phone" VARCHAR(20),
    "company" VARCHAR(200),
    "country" VARCHAR(100),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "payment_method" VARCHAR(50),
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_provider" VARCHAR(50),
    "transaction_id" VARCHAR(100),
    "payment_date" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "referrer" VARCHAR(500),
    "utm_data" JSONB,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "license_type" "public"."LicenseType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "access_granted" BOOLEAN NOT NULL DEFAULT false,
    "access_expiry" TIMESTAMP(3),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "download_limit" INTEGER,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enquiries" (
    "id" UUID NOT NULL,
    "report_id" UUID,
    "user_id" UUID,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "company" VARCHAR(200),
    "job_title" VARCHAR(100),
    "country" VARCHAR(100),
    "subject" VARCHAR(300),
    "message" TEXT,
    "enquiry_type" VARCHAR(50),
    "urgency" VARCHAR(20),
    "budget_range" VARCHAR(50),
    "decision_maker" BOOLEAN NOT NULL DEFAULT false,
    "timeline" VARCHAR(100),
    "company_size" VARCHAR(50),
    "industry" VARCHAR(100),
    "status" "public"."EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" UUID,
    "response_text" TEXT,
    "response_date" TIMESTAMP(3),
    "follow_up_date" TIMESTAMP(3),
    "source" VARCHAR(100),
    "utm_data" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_reviews" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "user_id" UUID,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT,
    "accuracy_rating" INTEGER,
    "usefulness_rating" INTEGER,
    "presentation_rating" INTEGER,
    "reviewer_name" VARCHAR(100),
    "reviewer_company" VARCHAR(200),
    "reviewer_job_title" VARCHAR(100),
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "reported" INTEGER NOT NULL DEFAULT 0,
    "moderator_note" TEXT,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "purchase_order_id" UUID,
    "verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blogs" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "excerpt" VARCHAR(500),
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "semantic_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" VARCHAR(300),
    "meta_description" VARCHAR(500),
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "share_count" BIGINT NOT NULL DEFAULT 0,
    "read_time" INTEGER,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_translations" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "excerpt" VARCHAR(500),
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localized_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" VARCHAR(300),
    "meta_description" VARCHAR(500),
    "translation_job_id" UUID,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "human_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "translation_quality" DECIMAL(3,2),
    "status" "public"."TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_analytics" (
    "id" UUID NOT NULL,
    "content_type" VARCHAR(50) NOT NULL,
    "content_id" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "search_engine" VARCHAR(20) NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "position" INTEGER,
    "impressions" BIGINT NOT NULL DEFAULT 0,
    "clicks" BIGINT NOT NULL DEFAULT 0,
    "ctr" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "country" VARCHAR(3),
    "device" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_report_sessions" (
    "id" UUID NOT NULL,
    "reportTitle" VARCHAR(500) NOT NULL,
    "totalInputTokens" INTEGER NOT NULL,
    "totalOutputTokens" INTEGER NOT NULL,
    "totalCost" DECIMAL(10,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_report_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_prompt_results" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "promptId" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DECIMAL(10,4) NOT NULL,
    "executionTime" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompt_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_shortcode_key" ON "public"."categories"("shortcode");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "public"."category_translations"("category_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "reports_sku_key" ON "public"."reports"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "reports_slug_key" ON "public"."reports"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "report_translations_report_id_locale_key" ON "public"."report_translations"("report_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_templates_name_key" ON "public"."ai_prompt_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "api_quotas_quota_type_service_type_quota_date_key" ON "public"."api_quotas"("quota_type", "service_type", "quota_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "public"."admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "public"."blogs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translations_blog_id_locale_key" ON "public"."blog_translations"("blog_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "seo_analytics_content_type_content_id_locale_search_engine__key" ON "public"."seo_analytics"("content_type", "content_id", "locale", "search_engine", "keyword", "date", "country", "device");

-- AddForeignKey
ALTER TABLE "public"."category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_content_generation_workflow_id_fkey" FOREIGN KEY ("content_generation_workflow_id") REFERENCES "public"."content_generation_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_translations" ADD CONSTRAINT "report_translations_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_generation_jobs" ADD CONSTRAINT "content_generation_jobs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."content_generation_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enquiries" ADD CONSTRAINT "enquiries_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enquiries" ADD CONSTRAINT "enquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_reviews" ADD CONSTRAINT "report_reviews_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_reviews" ADD CONSTRAINT "report_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_prompt_results" ADD CONSTRAINT "ai_prompt_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ai_report_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
