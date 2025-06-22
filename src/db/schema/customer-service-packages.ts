import { customers } from "@/db/schema/customers"
import { packages } from "@/db/schema/packages"
import { relations } from "drizzle-orm"
import { boolean, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"

export const customerServicePackages = pgTable("customer_service_packages", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  servicePackageId: uuid("service_package_id")
    .notNull()
    .references(() => packages.id),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  remainingSessions: integer("remaining_sessions").notNull(),
  totalSessions: integer("total_sessions").notNull(),
  paid: boolean("paid").notNull().default(false),
})
export const customerServicePackagesRelations = relations(
  customerServicePackages,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerServicePackages.customerId],
      references: [customers.id],
    }),
    servicePackage: one(packages, {
      fields: [customerServicePackages.servicePackageId],
      references: [packages.id],
    }),
  })
)
export type CustomerServicePackages =
  typeof customerServicePackages.$inferSelect
export type NewCustomerServicePackages =
  typeof customerServicePackages.$inferInsert
