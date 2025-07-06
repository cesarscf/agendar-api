import { relations } from "drizzle-orm"
import { integer, pgTable, uuid } from "drizzle-orm/pg-core"
import { customers } from "./customers"
import { loyaltyPrograms } from "./loyalty-programs"

export const customerLoyaltyPoints = pgTable("customer_loyalty_points", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  loyaltyProgramId: uuid("loyalty_program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  points: integer("points").notNull().default(0),
})

export const customerLoyaltyPointsRelations = relations(
  customerLoyaltyPoints,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerLoyaltyPoints.customerId],
      references: [customers.id],
      relationName: "loyaltyPointsCustomer",
    }),
    loyaltyProgram: one(loyaltyPrograms, {
      fields: [customerLoyaltyPoints.loyaltyProgramId],
      references: [loyaltyPrograms.id],
      relationName: "loyaltyPointsProgram",
    }),
  })
)

export type CustomerLoyaltyPoints = typeof customerLoyaltyPoints.$inferSelect
export type NewCustomerLoyaltyPoints = typeof customerLoyaltyPoints.$inferInsert
