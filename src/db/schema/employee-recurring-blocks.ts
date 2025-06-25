import { relations } from "drizzle-orm"
import { integer, pgTable, text, time, uuid } from "drizzle-orm/pg-core"
import { employees } from "./employees"

export const employeeRecurringBlocks = pgTable("employee_recurring_blocks", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  reason: text("reason"),
})

export const relationsEmployeeRecurringBlocks = relations(
  employeeRecurringBlocks,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeRecurringBlocks.employeeId],
      references: [employees.id],
    }),
  })
)

export type EmployeeRecurringBlock = typeof employeeRecurringBlocks.$inferSelect
export type NewEmployeeRecurringBlock =
  typeof employeeRecurringBlocks.$inferInsert
