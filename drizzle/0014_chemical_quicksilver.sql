ALTER TABLE "push_tokens" RENAME COLUMN "email" TO "userId";--> statement-breakpoint
ALTER TABLE "push_tokens" DROP CONSTRAINT "push_tokens_email_unique";--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_unique" UNIQUE("userId");