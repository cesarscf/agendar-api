import { appointments } from "@/db/schema/appointments"
import { employeeServices } from "@/db/schema/employee-services"
import { establishments } from "@/db/schema/establishments"
import { relations } from "drizzle-orm"
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const employees = pgTable("employees", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  avatarUrl: text("avatarUrl"),
  biography: text("biography"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const employeesRelations = relations(employees, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [employees.establishmentId],
    references: [establishments.id],
    relationName: "establishmentEmployees",
  }),
  employeeServices: many(employeeServices, {
    relationName: "employeeEmployeeServices",
  }),
  appointments: many(appointments, {
    relationName: "employeeAppointments",
  }),
}))

export type Employees = typeof employees.$inferSelect
export type NewEmployees = typeof employees.$inferInsert
