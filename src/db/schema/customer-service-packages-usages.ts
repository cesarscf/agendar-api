import { appointments } from "@/db/schema/appointments"
import { customerServicePackages } from "@/db/schema/customer-service-packages"
import { services } from "@/db/schema/services"
import { relations } from "drizzle-orm"
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core"

export const customerServicePackageUsages = pgTable(
  "customer_service_package_usages",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    customerServicePackageId: uuid("customer_service_package_id")
      .notNull()
      .references(() => customerServicePackages.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    appointmentId: uuid("appointment_id").references(() => appointments.id),
    usedAt: timestamp("used_at").notNull().defaultNow(),
  }
)
export const customerServicePackageUsagesRelations = relations(
  customerServicePackageUsages,
  ({ one }) => ({
    customerServicePackage: one(customerServicePackages, {
      fields: [customerServicePackageUsages.customerServicePackageId],
      references: [customerServicePackages.id],
      relationName: "customerServicePackageUsages",
    }),
    service: one(services, {
      fields: [customerServicePackageUsages.serviceId],
      references: [services.id],
      relationName: "serviceCustomerServicePackageUsages",
    }),
    appointment: one(appointments, {
      fields: [customerServicePackageUsages.appointmentId],
      references: [appointments.id],
      relationName: "appointmentCustomerServicePackageUsages",
    }),
  })
)
export type CustomerServicePackageUsages =
  typeof customerServicePackageUsages.$inferSelect
export type NewCustomerServicePackageUsages =
  typeof customerServicePackageUsages.$inferInsert
