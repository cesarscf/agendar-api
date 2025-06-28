CREATE TABLE "partner_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"integration_payment_method_id" text NOT NULL,
	"brand" text NOT NULL,
	"last4" text NOT NULL,
	"exp_month" integer NOT NULL,
	"exp_year" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "stripe_customer_id" TO "integration_subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "changed_from_subscription_id" text;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "integration_payment_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_payment_methods" ADD CONSTRAINT "partner_payment_methods_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_integration_payment_id_unique" UNIQUE("integration_payment_id");