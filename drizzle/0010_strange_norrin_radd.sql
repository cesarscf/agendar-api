ALTER TABLE "employees" RENAME COLUMN "image" TO "avatarUrl";--> statement-breakpoint
ALTER TABLE "establishments" DROP CONSTRAINT "establishments_slug_unique";--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "theme" text DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "logoUrl" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "bannerUrl" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "services_performed" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "active_customers" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "experience_time" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "google_maps_link" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "biography" text;