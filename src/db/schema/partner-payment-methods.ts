import { partners } from "@/db/schema/partners"
import { lifecycleDates } from "@/db/schema/utils"
import { relations } from "drizzle-orm"
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"
export const partnerPaymentMethods = pgTable("partner_payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  integrationPaymentMethodId: text("integration_payment_method_id").notNull(),
  brand: text("brand").notNull(),
  last4: text("last4").notNull(),
  expMonth: integer("exp_month").notNull(),
  expYear: integer("exp_year").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  ...lifecycleDates,
})

export const partnerPaymentMethodsRelations = relations(
  partnerPaymentMethods,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerPaymentMethods.partnerId],
      references: [partners.id],
    }),
  })
)

export type PartnerPaymentMethod = typeof partnerPaymentMethods.$inferSelect
export type NewPartnerPaymentMethod = typeof partnerPaymentMethods.$inferInsert
