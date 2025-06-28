import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { partners } from "./partners"
import { plans } from "./plans"
import { lifecycleDates } from "./utils"

export enum subscriptionStatusEnum {
  active = "active",
  canceled = "canceled",
  past_due = "past_due",
  trialing = "trialing",
  unpaid = "unpaid",
  incomplete = "incomplete",
  incomplete_expired = "incomplete_expired",
  paused = "paused",
}

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  integrationSubscriptionId: text("integration_subscription_id").notNull(),
  status: text("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  changedFromSubscriptionId: text("changed_from_subscription_id"),
  ...lifecycleDates,
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  partner: one(partners, {
    fields: [subscriptions.partnerId],
    references: [partners.id],
    relationName: "partnerSubscriptions",
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
    relationName: "subscriptionsPlan",
  }),
}))
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
