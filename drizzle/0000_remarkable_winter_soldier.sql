CREATE TABLE "about_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" text NOT NULL,
	"title" text,
	"content" text,
	"metadata" jsonb,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "admin_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_credentials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" jsonb,
	"content_html" text,
	"cover_url" text,
	"tags" text[] DEFAULT '{}',
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"reading_time_minutes" integer DEFAULT 5,
	"external_url" text,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"logo_url" text,
	"verify_url" text,
	"display_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"storage_path" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"mime_type" text,
	"width" integer,
	"height" integer,
	"folder" text DEFAULT 'general',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"link" text NOT NULL,
	"external" boolean DEFAULT false,
	"coming_soon" boolean DEFAULT false,
	"preview_image_url" text,
	"display_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" jsonb,
	"description_html" text,
	"thumbnail_url" text,
	"cover_url" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"tags" text[] DEFAULT '{}',
	"client" text,
	"role" text,
	"year" integer,
	"external_url" text,
	"is_featured" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"content_type" text DEFAULT 'text',
	"group_name" text,
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"icon_name" text,
	"display_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text,
	"author_avatar_url" text,
	"quote" text NOT NULL,
	"project_id" uuid,
	"is_visible" boolean DEFAULT true,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;