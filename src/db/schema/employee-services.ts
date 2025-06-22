import { employees } from "@/db/schema/employees"
import { services } from "@/db/schema/services"
import { relations } from "drizzle-orm"
import { boolean, decimal, pgTable, uuid } from "drizzle-orm/pg-core"

export const employeeServices = pgTable("employee_services", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  active: boolean("active").default(true).notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
})

export const employeeServicesRelations = relations(
  employeeServices,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeServices.employeeId],
      references: [employees.id],
      relationName: "employeeEmployeeServices",
    }),
    service: one(services, {
      fields: [employeeServices.serviceId],
      references: [services.id],
      relationName: "serviceEmployeeServices",
    }),
  })
)

export type EmployeeServices = typeof employeeServices.$inferSelect
export type NewEmployeeServices = typeof employeeServices.$inferInsert
