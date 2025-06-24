import { lifecycleDates } from "@/db/schema/utils"
import { decimal, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

export const plans = pgTable("plans", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  integrationPriceId: text("integration_price_id").notNull(),
  integrationId: text("integration_id").notNull(),
  intervalMonth: integer("interval_month").notNull(),
  trialPeriodDays: integer("trial_period_days").notNull(),
  minimumProfessionalsIncluded: integer(
    "minimum_professionals_included"
  ).notNull(),
  maximumProfessionalsIncluded: integer(
    "maximum_professionals_included"
  ).notNull(),
  status: text("status").notNull().default("inactive"),
  ...lifecycleDates,
})

export type Plans = typeof plans.$inferSelect
export type NewPlans = typeof plans.$inferInsert
