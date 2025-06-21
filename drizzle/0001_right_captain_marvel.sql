ALTER TABLE "clients" RENAME TO "customers";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "clients_phone_unique";--> statement-breakpoint
ALTER TABLE "requests" DROP CONSTRAINT "requests_author_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_author_id_customers_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_phone_unique" UNIQUE("phone");