import { partnerPaymentMethods } from "@/db/schema/partner-payment-methods"
import { subscriptions } from "@/db/schema/subscriptions"
import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { establishments } from "./establishments"
import { lifecycleDates } from "./utils"

export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  integrationPaymentId: text("integration_payment_id").notNull().unique(),

  ...lifecycleDates,
})

export const partnersRelations = relations(partners, ({ many }) => ({
  establishments: many(establishments, {
    relationName: "partnerEstablishments",
  }),
  paymentMethods: many(partnerPaymentMethods, {
    relationName: "partnerPaymentMethods",
  }),
  subscriptions: many(subscriptions, {
    relationName: "partnerSubscriptions",
  }),
}))

export type Partner = typeof partners.$inferSelect
export type NewPartner = typeof partners.$inferInsert
