import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_listings_documents_kind" AS ENUM('brochure', 'datasheet', 'pricelist', 'manual', 'certificate', 'video', 'other');
  CREATE TYPE "public"."enum_listings_documents_language" AS ENUM('en', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'multi');
  CREATE TYPE "public"."enum_listings_availability" AS ENUM('on-sale', 'orders-open', 'announced', 'discontinued');
  CREATE TYPE "public"."enum_listings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__listings_v_version_documents_kind" AS ENUM('brochure', 'datasheet', 'pricelist', 'manual', 'certificate', 'video', 'other');
  CREATE TYPE "public"."enum__listings_v_version_documents_language" AS ENUM('en', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'multi');
  CREATE TYPE "public"."enum__listings_v_version_availability" AS ENUM('on-sale', 'orders-open', 'announced', 'discontinued');
  CREATE TYPE "public"."enum__listings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__listings_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_brands_partnership_tier" AS ENUM('free', 'starter', 'pro');
  CREATE TYPE "public"."enum_brands_partnership_subscription_status" AS ENUM('none', 'trialing', 'active', 'past_due', 'canceled', 'manual');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_version_partnership_tier" AS ENUM('free', 'starter', 'pro');
  CREATE TYPE "public"."enum__brands_v_version_partnership_subscription_status" AS ENUM('none', 'trialing', 'active', 'past_due', 'canceled', 'manual');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_media_licence" AS ENUM('press-kit', 'manufacturer-permission', 'own', 'cc-by', 'cc-by-sa', 'other');
  CREATE TYPE "public"."enum_media_view" AS ENUM('side', 'front34', 'rear34', 'interior', 'cargo', 'action', 'detail');
  CREATE TYPE "public"."enum_documents_kind" AS ENUM('brochure', 'datasheet', 'pricelist', 'manual', 'certificate', 'video', 'other');
  CREATE TYPE "public"."enum_documents_language" AS ENUM('en', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'sv', 'da', 'multi');
  CREATE TYPE "public"."enum_vehicle_types_illustration" AS ENUM('van', 'pickup', 'utv', 'micro', 'bike', 'truck', 'tractor', 'bus', 'refuse', 'sweeper', 'carrier', 'excavator', 'loader', 'telehandler', 'dumper', 'roller', 'platform', 'agtractor', 'mower', 'forklift', 'yard', 'tug');
  CREATE TYPE "public"."enum_jobs_illustration" AS ENUM('van', 'pickup', 'utv', 'micro', 'bike', 'truck', 'tractor', 'bus', 'refuse', 'sweeper', 'carrier', 'excavator', 'loader', 'telehandler', 'dumper', 'roller', 'platform', 'agtractor', 'mower', 'forklift', 'yard', 'tug');
  CREATE TYPE "public"."enum_specs_data_type" AS ENUM('number', 'select', 'multiselect', 'boolean', 'feature', 'text');
  CREATE TYPE "public"."enum_specs_better" AS ENUM('none', 'high', 'low');
  CREATE TYPE "public"."enum_specs_group" AS ENUM('energy', 'charging', 'performance', 'dimensions', 'capacity', 'work', 'operation', 'commercial');
  CREATE TYPE "public"."enum_landing_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_pages_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_pages_key" AS ENUM('about', 'methodology', 'how-ranking-works', 'for-manufacturers', 'imprint', 'privacy', 'partner-terms', 'data');
  CREATE TYPE "public"."enum_change_requests_kind" AS ENUM('correction', 'partner-edit', 'claim');
  CREATE TYPE "public"."enum_change_requests_status" AS ENUM('new', 'in-review', 'applied', 'rejected', 'spam');
  CREATE TYPE "public"."enum_change_requests_submitter_relation" AS ENUM('buyer', 'manufacturer', 'dealer', 'press', 'other');
  CREATE TYPE "public"."enum_placements_kind" AS ENUM('featured-listing', 'brand-spotlight');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'partner');
  CREATE TYPE "public"."enum_pricing_tiers_tier" AS ENUM('free', 'starter', 'pro');
  CREATE TABLE "listings_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "listings_key_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "listings_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_listings_documents_kind" DEFAULT 'brochure',
  	"language" "enum_listings_documents_language" DEFAULT 'en',
  	"file_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "listings_documents_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "listings_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "listings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"brand_id" integer,
  	"model" varchar,
  	"family" varchar,
  	"vehicle_type_id" integer,
  	"availability" "enum_listings_availability" DEFAULT 'on-sale',
  	"specs" jsonb DEFAULT '{}'::jsonb,
  	"source_url" varchar,
  	"verified_at" timestamp(3) with time zone,
  	"internal_notes" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_listings_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "listings_locales" (
  	"summary" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "listings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"jobs_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_listings_v_version_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_listings_v_version_key_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_listings_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__listings_v_version_documents_kind" DEFAULT 'brochure',
  	"language" "enum__listings_v_version_documents_language" DEFAULT 'en',
  	"file_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_listings_v_version_documents_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_listings_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_listings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_brand_id" integer,
  	"version_model" varchar,
  	"version_family" varchar,
  	"version_vehicle_type_id" integer,
  	"version_availability" "enum__listings_v_version_availability" DEFAULT 'on-sale',
  	"version_specs" jsonb DEFAULT '{}'::jsonb,
  	"version_source_url" varchar,
  	"version_verified_at" timestamp(3) with time zone,
  	"version_internal_notes" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__listings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__listings_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_listings_v_locales" (
  	"version_summary" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_listings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"jobs_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"logo_id" integer,
  	"website" varchar,
  	"country" varchar,
  	"contact_name" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"partnership_tier" "enum_brands_partnership_tier" DEFAULT 'free',
  	"partnership_valid_until" timestamp(3) with time zone,
  	"partnership_subscription_status" "enum_brands_partnership_subscription_status" DEFAULT 'none',
  	"partnership_boost_in_recommended" boolean DEFAULT true,
  	"partnership_highlight_cards" boolean DEFAULT true,
  	"partnership_stripe_customer_id" varchar,
  	"partnership_stripe_subscription_id" varchar,
  	"partnership_billed_models" numeric,
  	"demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_brands_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "brands_locales" (
  	"description" varchar,
  	"tagline" varchar,
  	"contact_role" varchar,
  	"contact_region" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_logo_id" integer,
  	"version_website" varchar,
  	"version_country" varchar,
  	"version_contact_name" varchar,
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version_partnership_tier" "enum__brands_v_version_partnership_tier" DEFAULT 'free',
  	"version_partnership_valid_until" timestamp(3) with time zone,
  	"version_partnership_subscription_status" "enum__brands_v_version_partnership_subscription_status" DEFAULT 'none',
  	"version_partnership_boost_in_recommended" boolean DEFAULT true,
  	"version_partnership_highlight_cards" boolean DEFAULT true,
  	"version_partnership_stripe_customer_id" varchar,
  	"version_partnership_stripe_subscription_id" varchar,
  	"version_partnership_billed_models" numeric,
  	"version_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brands_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__brands_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_brands_v_locales" (
  	"version_description" varchar,
  	"version_tagline" varchar,
  	"version_contact_role" varchar,
  	"version_contact_region" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar NOT NULL,
  	"licence" "enum_media_licence" DEFAULT 'press-kit' NOT NULL,
  	"source_url" varchar,
  	"view" "enum_media_view",
  	"licence_note" varchar,
  	"uploaded_by_id" integer,
  	"prefix" varchar DEFAULT 'media',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_documents_kind" DEFAULT 'brochure' NOT NULL,
  	"language" "enum_documents_language" DEFAULT 'en',
  	"uploaded_by_id" integer,
  	"prefix" varchar DEFAULT 'documents',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "vehicle_types_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "vehicle_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 100,
  	"illustration" "enum_vehicle_types_illustration",
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vehicle_types_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"short_description" varchar,
  	"intro" jsonb,
  	"synonyms" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "vehicle_types_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vehicle_types_id" integer,
  	"specs_id" integer
  );
  
  CREATE TABLE "jobs_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 100,
  	"illustration" "enum_jobs_illustration",
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"short_description" varchar,
  	"intro" jsonb,
  	"synonyms" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "jobs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vehicle_types_id" integer
  );
  
  CREATE TABLE "specs_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "specs_options_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "specs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"url_key" varchar NOT NULL,
  	"data_type" "enum_specs_data_type" DEFAULT 'number' NOT NULL,
  	"unit" varchar,
  	"unit_code" varchar,
  	"decimals" numeric,
  	"better" "enum_specs_better" DEFAULT 'none',
  	"min" numeric,
  	"max" numeric,
  	"quick_filter_enabled" boolean DEFAULT false,
  	"quick_filter_min" numeric,
  	"group" "enum_specs_group" DEFAULT 'energy' NOT NULL,
  	"order" numeric DEFAULT 100,
  	"universal" boolean DEFAULT false,
  	"filterable" boolean DEFAULT true,
  	"show_in_compare" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "specs_locales" (
  	"label" varchar NOT NULL,
  	"short_label" varchar,
  	"help" varchar,
  	"quick_filter_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "landing_pages_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "landing_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_title" varchar,
  	"vehicle_type_id" integer,
  	"job_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_landing_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "landing_pages_locales" (
  	"title" varchar,
  	"intro" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_landing_pages_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_internal_title" varchar,
  	"version_vehicle_type_id" integer,
  	"version_job_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__landing_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__landing_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_landing_pages_v_locales" (
  	"version_title" varchar,
  	"version_intro" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "guides_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"author_name" varchar,
  	"published_at" timestamp(3) with time zone,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "guides_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"author_role" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vehicle_types_id" integer,
  	"jobs_id" integer,
  	"listings_id" integer
  );
  
  CREATE TABLE "_guides_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_hero_image_id" integer,
  	"version_author_name" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__guides_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_guides_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_author_role" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vehicle_types_id" integer,
  	"jobs_id" integer,
  	"listings_id" integer
  );
  
  CREATE TABLE "pages_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum_pages_key" NOT NULL,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "change_requests_changes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"current" varchar,
  	"proposed" varchar
  );
  
  CREATE TABLE "change_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"kind" "enum_change_requests_kind" DEFAULT 'correction' NOT NULL,
  	"status" "enum_change_requests_status" DEFAULT 'new' NOT NULL,
  	"locale" varchar,
  	"listing_id" integer,
  	"brand_id" integer,
  	"message" varchar,
  	"source_url" varchar,
  	"submitter_name" varchar,
  	"submitter_email" varchar,
  	"submitter_company" varchar,
  	"submitter_relation" "enum_change_requests_submitter_relation",
  	"internal_note" varchar,
  	"fingerprint" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "placements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_placements_kind" DEFAULT 'featured-listing' NOT NULL,
  	"brand_id" integer NOT NULL,
  	"on_home" boolean DEFAULT false,
  	"on_brand_hub" boolean DEFAULT false,
  	"on_guides" boolean DEFAULT false,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone NOT NULL,
  	"priority" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "placements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"listings_id" integer,
  	"vehicle_types_id" integer,
  	"jobs_id" integer
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'partner' NOT NULL,
  	"brand_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"listings_id" integer,
  	"brands_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"vehicle_types_id" integer,
  	"jobs_id" integer,
  	"specs_id" integer,
  	"landing_pages_id" integer,
  	"guides_id" integer,
  	"pages_id" integer,
  	"change_requests_id" integer,
  	"placements_id" integer,
  	"users_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_organization_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_email" varchar,
  	"partners_email" varchar,
  	"organization_legal_name" varchar,
  	"organization_logo_id" integer,
  	"owner_name" varchar,
  	"owner_url" varchar,
  	"open_data_enabled" boolean DEFAULT false,
  	"open_data_licence" varchar DEFAULT 'CC BY 4.0',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_locales" (
  	"tagline" varchar,
  	"notice" varchar,
  	"owner_role" varchar,
  	"owner_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "pricing_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier" "enum_pricing_tiers_tier" NOT NULL,
  	"price_per_model_year" numeric,
  	"highlight" boolean
  );
  
  CREATE TABLE "pricing_tiers_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pricing_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "listings_key_facts" ADD CONSTRAINT "listings_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_key_benefits" ADD CONSTRAINT "listings_key_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_documents" ADD CONSTRAINT "listings_documents_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings_documents" ADD CONSTRAINT "listings_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_documents_locales" ADD CONSTRAINT "listings_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_sources" ADD CONSTRAINT "listings_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings_locales" ADD CONSTRAINT "listings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_rels" ADD CONSTRAINT "listings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_rels" ADD CONSTRAINT "listings_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_rels" ADD CONSTRAINT "listings_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_version_key_facts" ADD CONSTRAINT "_listings_v_version_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_version_key_benefits" ADD CONSTRAINT "_listings_v_version_key_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_version_documents" ADD CONSTRAINT "_listings_v_version_documents_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_listings_v_version_documents" ADD CONSTRAINT "_listings_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_version_documents_locales" ADD CONSTRAINT "_listings_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_version_sources" ADD CONSTRAINT "_listings_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v" ADD CONSTRAINT "_listings_v_parent_id_listings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_listings_v" ADD CONSTRAINT "_listings_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_listings_v" ADD CONSTRAINT "_listings_v_version_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("version_vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_listings_v_locales" ADD CONSTRAINT "_listings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_locales" ADD CONSTRAINT "brands_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v_locales" ADD CONSTRAINT "_brands_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_brands_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vehicle_types_faqs" ADD CONSTRAINT "vehicle_types_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_parent_id_vehicle_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vehicle_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vehicle_types_locales" ADD CONSTRAINT "vehicle_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vehicle_types_rels" ADD CONSTRAINT "vehicle_types_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vehicle_types_rels" ADD CONSTRAINT "vehicle_types_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vehicle_types_rels" ADD CONSTRAINT "vehicle_types_rels_specs_fk" FOREIGN KEY ("specs_id") REFERENCES "public"."specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_faqs" ADD CONSTRAINT "jobs_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specs_options" ADD CONSTRAINT "specs_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specs_options_locales" ADD CONSTRAINT "specs_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specs_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specs_locales" ADD CONSTRAINT "specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages_faqs" ADD CONSTRAINT "landing_pages_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_pages_locales" ADD CONSTRAINT "landing_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_version_faqs" ADD CONSTRAINT "_landing_pages_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_parent_id_landing_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("version_vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v" ADD CONSTRAINT "_landing_pages_v_version_job_id_jobs_id_fk" FOREIGN KEY ("version_job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_pages_v_locales" ADD CONSTRAINT "_landing_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_faqs" ADD CONSTRAINT "guides_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_locales" ADD CONSTRAINT "guides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_faqs" ADD CONSTRAINT "_guides_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_locales" ADD CONSTRAINT "_guides_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faqs" ADD CONSTRAINT "pages_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "change_requests_changes" ADD CONSTRAINT "change_requests_changes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."change_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "placements" ADD CONSTRAINT "placements_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "placements_rels" ADD CONSTRAINT "placements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."placements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "placements_rels" ADD CONSTRAINT "placements_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "placements_rels" ADD CONSTRAINT "placements_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "placements_rels" ADD CONSTRAINT "placements_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vehicle_types_fk" FOREIGN KEY ("vehicle_types_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_specs_fk" FOREIGN KEY ("specs_id") REFERENCES "public"."specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_landing_pages_fk" FOREIGN KEY ("landing_pages_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_change_requests_fk" FOREIGN KEY ("change_requests_id") REFERENCES "public"."change_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_placements_fk" FOREIGN KEY ("placements_id") REFERENCES "public"."placements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_organization_same_as" ADD CONSTRAINT "settings_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_organization_logo_id_media_id_fk" FOREIGN KEY ("organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_tiers_features" ADD CONSTRAINT "pricing_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_tiers" ADD CONSTRAINT "pricing_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_tiers_locales" ADD CONSTRAINT "pricing_tiers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_locales" ADD CONSTRAINT "pricing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "listings_key_facts_order_idx" ON "listings_key_facts" USING btree ("_order");
  CREATE INDEX "listings_key_facts_parent_id_idx" ON "listings_key_facts" USING btree ("_parent_id");
  CREATE INDEX "listings_key_facts_locale_idx" ON "listings_key_facts" USING btree ("_locale");
  CREATE INDEX "listings_key_benefits_order_idx" ON "listings_key_benefits" USING btree ("_order");
  CREATE INDEX "listings_key_benefits_parent_id_idx" ON "listings_key_benefits" USING btree ("_parent_id");
  CREATE INDEX "listings_key_benefits_locale_idx" ON "listings_key_benefits" USING btree ("_locale");
  CREATE INDEX "listings_documents_order_idx" ON "listings_documents" USING btree ("_order");
  CREATE INDEX "listings_documents_parent_id_idx" ON "listings_documents" USING btree ("_parent_id");
  CREATE INDEX "listings_documents_file_idx" ON "listings_documents" USING btree ("file_id");
  CREATE UNIQUE INDEX "listings_documents_locales_locale_parent_id_unique" ON "listings_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "listings_sources_order_idx" ON "listings_sources" USING btree ("_order");
  CREATE INDEX "listings_sources_parent_id_idx" ON "listings_sources" USING btree ("_parent_id");
  CREATE INDEX "listings_title_idx" ON "listings" USING btree ("title");
  CREATE INDEX "listings_brand_idx" ON "listings" USING btree ("brand_id");
  CREATE INDEX "listings_vehicle_type_idx" ON "listings" USING btree ("vehicle_type_id");
  CREATE UNIQUE INDEX "listings_slug_idx" ON "listings" USING btree ("slug");
  CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at");
  CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");
  CREATE INDEX "listings__status_idx" ON "listings" USING btree ("_status");
  CREATE UNIQUE INDEX "listings_locales_locale_parent_id_unique" ON "listings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "listings_rels_order_idx" ON "listings_rels" USING btree ("order");
  CREATE INDEX "listings_rels_parent_idx" ON "listings_rels" USING btree ("parent_id");
  CREATE INDEX "listings_rels_path_idx" ON "listings_rels" USING btree ("path");
  CREATE INDEX "listings_rels_jobs_id_idx" ON "listings_rels" USING btree ("jobs_id");
  CREATE INDEX "listings_rels_media_id_idx" ON "listings_rels" USING btree ("media_id");
  CREATE INDEX "_listings_v_version_key_facts_order_idx" ON "_listings_v_version_key_facts" USING btree ("_order");
  CREATE INDEX "_listings_v_version_key_facts_parent_id_idx" ON "_listings_v_version_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_version_key_facts_locale_idx" ON "_listings_v_version_key_facts" USING btree ("_locale");
  CREATE INDEX "_listings_v_version_key_benefits_order_idx" ON "_listings_v_version_key_benefits" USING btree ("_order");
  CREATE INDEX "_listings_v_version_key_benefits_parent_id_idx" ON "_listings_v_version_key_benefits" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_version_key_benefits_locale_idx" ON "_listings_v_version_key_benefits" USING btree ("_locale");
  CREATE INDEX "_listings_v_version_documents_order_idx" ON "_listings_v_version_documents" USING btree ("_order");
  CREATE INDEX "_listings_v_version_documents_parent_id_idx" ON "_listings_v_version_documents" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_version_documents_file_idx" ON "_listings_v_version_documents" USING btree ("file_id");
  CREATE UNIQUE INDEX "_listings_v_version_documents_locales_locale_parent_id_uniqu" ON "_listings_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_listings_v_version_sources_order_idx" ON "_listings_v_version_sources" USING btree ("_order");
  CREATE INDEX "_listings_v_version_sources_parent_id_idx" ON "_listings_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_parent_idx" ON "_listings_v" USING btree ("parent_id");
  CREATE INDEX "_listings_v_version_version_title_idx" ON "_listings_v" USING btree ("version_title");
  CREATE INDEX "_listings_v_version_version_brand_idx" ON "_listings_v" USING btree ("version_brand_id");
  CREATE INDEX "_listings_v_version_version_vehicle_type_idx" ON "_listings_v" USING btree ("version_vehicle_type_id");
  CREATE INDEX "_listings_v_version_version_slug_idx" ON "_listings_v" USING btree ("version_slug");
  CREATE INDEX "_listings_v_version_version_updated_at_idx" ON "_listings_v" USING btree ("version_updated_at");
  CREATE INDEX "_listings_v_version_version_created_at_idx" ON "_listings_v" USING btree ("version_created_at");
  CREATE INDEX "_listings_v_version_version__status_idx" ON "_listings_v" USING btree ("version__status");
  CREATE INDEX "_listings_v_created_at_idx" ON "_listings_v" USING btree ("created_at");
  CREATE INDEX "_listings_v_updated_at_idx" ON "_listings_v" USING btree ("updated_at");
  CREATE INDEX "_listings_v_snapshot_idx" ON "_listings_v" USING btree ("snapshot");
  CREATE INDEX "_listings_v_published_locale_idx" ON "_listings_v" USING btree ("published_locale");
  CREATE INDEX "_listings_v_latest_idx" ON "_listings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_listings_v_locales_locale_parent_id_unique" ON "_listings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_listings_v_rels_order_idx" ON "_listings_v_rels" USING btree ("order");
  CREATE INDEX "_listings_v_rels_parent_idx" ON "_listings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_listings_v_rels_path_idx" ON "_listings_v_rels" USING btree ("path");
  CREATE INDEX "_listings_v_rels_jobs_id_idx" ON "_listings_v_rels" USING btree ("jobs_id");
  CREATE INDEX "_listings_v_rels_media_id_idx" ON "_listings_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "brands_name_idx" ON "brands" USING btree ("name");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands__status_idx" ON "brands" USING btree ("_status");
  CREATE UNIQUE INDEX "brands_locales_locale_parent_id_unique" ON "brands_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_name_idx" ON "_brands_v" USING btree ("version_name");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version__status_idx" ON "_brands_v" USING btree ("version__status");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_snapshot_idx" ON "_brands_v" USING btree ("snapshot");
  CREATE INDEX "_brands_v_published_locale_idx" ON "_brands_v" USING btree ("published_locale");
  CREATE INDEX "_brands_v_latest_idx" ON "_brands_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_brands_v_locales_locale_parent_id_unique" ON "_brands_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_uploaded_by_idx" ON "documents" USING btree ("uploaded_by_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "vehicle_types_faqs_order_idx" ON "vehicle_types_faqs" USING btree ("_order");
  CREATE INDEX "vehicle_types_faqs_parent_id_idx" ON "vehicle_types_faqs" USING btree ("_parent_id");
  CREATE INDEX "vehicle_types_faqs_locale_idx" ON "vehicle_types_faqs" USING btree ("_locale");
  CREATE INDEX "vehicle_types_parent_idx" ON "vehicle_types" USING btree ("parent_id");
  CREATE INDEX "vehicle_types_updated_at_idx" ON "vehicle_types" USING btree ("updated_at");
  CREATE INDEX "vehicle_types_created_at_idx" ON "vehicle_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "vehicle_types_slug_idx" ON "vehicle_types_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "vehicle_types_locales_locale_parent_id_unique" ON "vehicle_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "vehicle_types_rels_order_idx" ON "vehicle_types_rels" USING btree ("order");
  CREATE INDEX "vehicle_types_rels_parent_idx" ON "vehicle_types_rels" USING btree ("parent_id");
  CREATE INDEX "vehicle_types_rels_path_idx" ON "vehicle_types_rels" USING btree ("path");
  CREATE INDEX "vehicle_types_rels_vehicle_types_id_idx" ON "vehicle_types_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "vehicle_types_rels_specs_id_idx" ON "vehicle_types_rels" USING btree ("specs_id");
  CREATE INDEX "jobs_faqs_order_idx" ON "jobs_faqs" USING btree ("_order");
  CREATE INDEX "jobs_faqs_parent_id_idx" ON "jobs_faqs" USING btree ("_parent_id");
  CREATE INDEX "jobs_faqs_locale_idx" ON "jobs_faqs" USING btree ("_locale");
  CREATE INDEX "jobs_parent_idx" ON "jobs" USING btree ("parent_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE UNIQUE INDEX "jobs_slug_idx" ON "jobs_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_rels_order_idx" ON "jobs_rels" USING btree ("order");
  CREATE INDEX "jobs_rels_parent_idx" ON "jobs_rels" USING btree ("parent_id");
  CREATE INDEX "jobs_rels_path_idx" ON "jobs_rels" USING btree ("path");
  CREATE INDEX "jobs_rels_vehicle_types_id_idx" ON "jobs_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "specs_options_order_idx" ON "specs_options" USING btree ("_order");
  CREATE INDEX "specs_options_parent_id_idx" ON "specs_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "specs_options_locales_locale_parent_id_unique" ON "specs_options_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "specs_key_idx" ON "specs" USING btree ("key");
  CREATE UNIQUE INDEX "specs_url_key_idx" ON "specs" USING btree ("url_key");
  CREATE INDEX "specs_updated_at_idx" ON "specs" USING btree ("updated_at");
  CREATE INDEX "specs_created_at_idx" ON "specs" USING btree ("created_at");
  CREATE UNIQUE INDEX "specs_locales_locale_parent_id_unique" ON "specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "landing_pages_faqs_order_idx" ON "landing_pages_faqs" USING btree ("_order");
  CREATE INDEX "landing_pages_faqs_parent_id_idx" ON "landing_pages_faqs" USING btree ("_parent_id");
  CREATE INDEX "landing_pages_faqs_locale_idx" ON "landing_pages_faqs" USING btree ("_locale");
  CREATE INDEX "landing_pages_vehicle_type_idx" ON "landing_pages" USING btree ("vehicle_type_id");
  CREATE INDEX "landing_pages_job_idx" ON "landing_pages" USING btree ("job_id");
  CREATE INDEX "landing_pages_updated_at_idx" ON "landing_pages" USING btree ("updated_at");
  CREATE INDEX "landing_pages_created_at_idx" ON "landing_pages" USING btree ("created_at");
  CREATE INDEX "landing_pages__status_idx" ON "landing_pages" USING btree ("_status");
  CREATE UNIQUE INDEX "landing_pages_locales_locale_parent_id_unique" ON "landing_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_landing_pages_v_version_faqs_order_idx" ON "_landing_pages_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_landing_pages_v_version_faqs_parent_id_idx" ON "_landing_pages_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_landing_pages_v_version_faqs_locale_idx" ON "_landing_pages_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_landing_pages_v_parent_idx" ON "_landing_pages_v" USING btree ("parent_id");
  CREATE INDEX "_landing_pages_v_version_version_vehicle_type_idx" ON "_landing_pages_v" USING btree ("version_vehicle_type_id");
  CREATE INDEX "_landing_pages_v_version_version_job_idx" ON "_landing_pages_v" USING btree ("version_job_id");
  CREATE INDEX "_landing_pages_v_version_version_updated_at_idx" ON "_landing_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_landing_pages_v_version_version_created_at_idx" ON "_landing_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_landing_pages_v_version_version__status_idx" ON "_landing_pages_v" USING btree ("version__status");
  CREATE INDEX "_landing_pages_v_created_at_idx" ON "_landing_pages_v" USING btree ("created_at");
  CREATE INDEX "_landing_pages_v_updated_at_idx" ON "_landing_pages_v" USING btree ("updated_at");
  CREATE INDEX "_landing_pages_v_snapshot_idx" ON "_landing_pages_v" USING btree ("snapshot");
  CREATE INDEX "_landing_pages_v_published_locale_idx" ON "_landing_pages_v" USING btree ("published_locale");
  CREATE INDEX "_landing_pages_v_latest_idx" ON "_landing_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_landing_pages_v_locales_locale_parent_id_unique" ON "_landing_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_faqs_order_idx" ON "guides_faqs" USING btree ("_order");
  CREATE INDEX "guides_faqs_parent_id_idx" ON "guides_faqs" USING btree ("_parent_id");
  CREATE INDEX "guides_faqs_locale_idx" ON "guides_faqs" USING btree ("_locale");
  CREATE INDEX "guides_hero_image_idx" ON "guides" USING btree ("hero_image_id");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "guides_locales_locale_parent_id_unique" ON "guides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_rels_order_idx" ON "guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_vehicle_types_id_idx" ON "guides_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "guides_rels_jobs_id_idx" ON "guides_rels" USING btree ("jobs_id");
  CREATE INDEX "guides_rels_listings_id_idx" ON "guides_rels" USING btree ("listings_id");
  CREATE INDEX "_guides_v_version_faqs_order_idx" ON "_guides_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_guides_v_version_faqs_parent_id_idx" ON "_guides_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_faqs_locale_idx" ON "_guides_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_hero_image_idx" ON "_guides_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_snapshot_idx" ON "_guides_v" USING btree ("snapshot");
  CREATE INDEX "_guides_v_published_locale_idx" ON "_guides_v" USING btree ("published_locale");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_guides_v_locales_locale_parent_id_unique" ON "_guides_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_guides_v_rels_order_idx" ON "_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_vehicle_types_id_idx" ON "_guides_v_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "_guides_v_rels_jobs_id_idx" ON "_guides_v_rels" USING btree ("jobs_id");
  CREATE INDEX "_guides_v_rels_listings_id_idx" ON "_guides_v_rels" USING btree ("listings_id");
  CREATE INDEX "pages_faqs_order_idx" ON "pages_faqs" USING btree ("_order");
  CREATE INDEX "pages_faqs_parent_id_idx" ON "pages_faqs" USING btree ("_parent_id");
  CREATE INDEX "pages_faqs_locale_idx" ON "pages_faqs" USING btree ("_locale");
  CREATE UNIQUE INDEX "pages_key_idx" ON "pages" USING btree ("key");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "change_requests_changes_order_idx" ON "change_requests_changes" USING btree ("_order");
  CREATE INDEX "change_requests_changes_parent_id_idx" ON "change_requests_changes" USING btree ("_parent_id");
  CREATE INDEX "change_requests_listing_idx" ON "change_requests" USING btree ("listing_id");
  CREATE INDEX "change_requests_brand_idx" ON "change_requests" USING btree ("brand_id");
  CREATE INDEX "change_requests_fingerprint_idx" ON "change_requests" USING btree ("fingerprint");
  CREATE INDEX "change_requests_updated_at_idx" ON "change_requests" USING btree ("updated_at");
  CREATE INDEX "change_requests_created_at_idx" ON "change_requests" USING btree ("created_at");
  CREATE INDEX "placements_brand_idx" ON "placements" USING btree ("brand_id");
  CREATE INDEX "placements_updated_at_idx" ON "placements" USING btree ("updated_at");
  CREATE INDEX "placements_created_at_idx" ON "placements" USING btree ("created_at");
  CREATE INDEX "placements_rels_order_idx" ON "placements_rels" USING btree ("order");
  CREATE INDEX "placements_rels_parent_idx" ON "placements_rels" USING btree ("parent_id");
  CREATE INDEX "placements_rels_path_idx" ON "placements_rels" USING btree ("path");
  CREATE INDEX "placements_rels_listings_id_idx" ON "placements_rels" USING btree ("listings_id");
  CREATE INDEX "placements_rels_vehicle_types_id_idx" ON "placements_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "placements_rels_jobs_id_idx" ON "placements_rels" USING btree ("jobs_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_brand_idx" ON "users" USING btree ("brand_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_listings_id_idx" ON "payload_locked_documents_rels" USING btree ("listings_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_vehicle_types_id_idx" ON "payload_locked_documents_rels" USING btree ("vehicle_types_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_specs_id_idx" ON "payload_locked_documents_rels" USING btree ("specs_id");
  CREATE INDEX "payload_locked_documents_rels_landing_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("landing_pages_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_change_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("change_requests_id");
  CREATE INDEX "payload_locked_documents_rels_placements_id_idx" ON "payload_locked_documents_rels" USING btree ("placements_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_organization_same_as_order_idx" ON "settings_organization_same_as" USING btree ("_order");
  CREATE INDEX "settings_organization_same_as_parent_id_idx" ON "settings_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX "settings_organization_organization_logo_idx" ON "settings" USING btree ("organization_logo_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_tiers_features_order_idx" ON "pricing_tiers_features" USING btree ("_order");
  CREATE INDEX "pricing_tiers_features_parent_id_idx" ON "pricing_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "pricing_tiers_features_locale_idx" ON "pricing_tiers_features" USING btree ("_locale");
  CREATE INDEX "pricing_tiers_order_idx" ON "pricing_tiers" USING btree ("_order");
  CREATE INDEX "pricing_tiers_parent_id_idx" ON "pricing_tiers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pricing_tiers_locales_locale_parent_id_unique" ON "pricing_tiers_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pricing_locales_locale_parent_id_unique" ON "pricing_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "listings_key_facts" CASCADE;
  DROP TABLE "listings_key_benefits" CASCADE;
  DROP TABLE "listings_documents" CASCADE;
  DROP TABLE "listings_documents_locales" CASCADE;
  DROP TABLE "listings_sources" CASCADE;
  DROP TABLE "listings" CASCADE;
  DROP TABLE "listings_locales" CASCADE;
  DROP TABLE "listings_rels" CASCADE;
  DROP TABLE "_listings_v_version_key_facts" CASCADE;
  DROP TABLE "_listings_v_version_key_benefits" CASCADE;
  DROP TABLE "_listings_v_version_documents" CASCADE;
  DROP TABLE "_listings_v_version_documents_locales" CASCADE;
  DROP TABLE "_listings_v_version_sources" CASCADE;
  DROP TABLE "_listings_v" CASCADE;
  DROP TABLE "_listings_v_locales" CASCADE;
  DROP TABLE "_listings_v_rels" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "brands_locales" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "_brands_v_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "vehicle_types_faqs" CASCADE;
  DROP TABLE "vehicle_types" CASCADE;
  DROP TABLE "vehicle_types_locales" CASCADE;
  DROP TABLE "vehicle_types_rels" CASCADE;
  DROP TABLE "jobs_faqs" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  DROP TABLE "jobs_rels" CASCADE;
  DROP TABLE "specs_options" CASCADE;
  DROP TABLE "specs_options_locales" CASCADE;
  DROP TABLE "specs" CASCADE;
  DROP TABLE "specs_locales" CASCADE;
  DROP TABLE "landing_pages_faqs" CASCADE;
  DROP TABLE "landing_pages" CASCADE;
  DROP TABLE "landing_pages_locales" CASCADE;
  DROP TABLE "_landing_pages_v_version_faqs" CASCADE;
  DROP TABLE "_landing_pages_v" CASCADE;
  DROP TABLE "_landing_pages_v_locales" CASCADE;
  DROP TABLE "guides_faqs" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "guides_locales" CASCADE;
  DROP TABLE "guides_rels" CASCADE;
  DROP TABLE "_guides_v_version_faqs" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "_guides_v_locales" CASCADE;
  DROP TABLE "_guides_v_rels" CASCADE;
  DROP TABLE "pages_faqs" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "change_requests_changes" CASCADE;
  DROP TABLE "change_requests" CASCADE;
  DROP TABLE "placements" CASCADE;
  DROP TABLE "placements_rels" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_organization_same_as" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "settings_locales" CASCADE;
  DROP TABLE "pricing_tiers_features" CASCADE;
  DROP TABLE "pricing_tiers" CASCADE;
  DROP TABLE "pricing_tiers_locales" CASCADE;
  DROP TABLE "pricing" CASCADE;
  DROP TABLE "pricing_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_listings_documents_kind";
  DROP TYPE "public"."enum_listings_documents_language";
  DROP TYPE "public"."enum_listings_availability";
  DROP TYPE "public"."enum_listings_status";
  DROP TYPE "public"."enum__listings_v_version_documents_kind";
  DROP TYPE "public"."enum__listings_v_version_documents_language";
  DROP TYPE "public"."enum__listings_v_version_availability";
  DROP TYPE "public"."enum__listings_v_version_status";
  DROP TYPE "public"."enum__listings_v_published_locale";
  DROP TYPE "public"."enum_brands_partnership_tier";
  DROP TYPE "public"."enum_brands_partnership_subscription_status";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum__brands_v_version_partnership_tier";
  DROP TYPE "public"."enum__brands_v_version_partnership_subscription_status";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum__brands_v_published_locale";
  DROP TYPE "public"."enum_media_licence";
  DROP TYPE "public"."enum_media_view";
  DROP TYPE "public"."enum_documents_kind";
  DROP TYPE "public"."enum_documents_language";
  DROP TYPE "public"."enum_vehicle_types_illustration";
  DROP TYPE "public"."enum_jobs_illustration";
  DROP TYPE "public"."enum_specs_data_type";
  DROP TYPE "public"."enum_specs_better";
  DROP TYPE "public"."enum_specs_group";
  DROP TYPE "public"."enum_landing_pages_status";
  DROP TYPE "public"."enum__landing_pages_v_version_status";
  DROP TYPE "public"."enum__landing_pages_v_published_locale";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum__guides_v_published_locale";
  DROP TYPE "public"."enum_pages_key";
  DROP TYPE "public"."enum_change_requests_kind";
  DROP TYPE "public"."enum_change_requests_status";
  DROP TYPE "public"."enum_change_requests_submitter_relation";
  DROP TYPE "public"."enum_placements_kind";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pricing_tiers_tier";`)
}
