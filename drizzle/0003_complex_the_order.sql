CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"integration_price_id" text NOT NULL,
	"integration_id" text NOT NULL,
	"interval_month" integer NOT NULL,
	"trial_period_days" integer NOT NULL,
	"minimum_professionals_included" integer NOT NULL,
	"maximum_professionals_included" integer NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "birth_date" SET NOT NULL;