import { employees } from "@/db/schema/employees"
import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const employeeTimeBlocks = pgTable("employee_time_blocks", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
})

export const relationsEmployeeTimeBlocks = relations(
  employeeTimeBlocks,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeTimeBlocks.employeeId],
      references: [employees.id],
    }),
  })
)

export type EmployeeTimeBlocks = typeof employeeTimeBlocks.$inferSelect
export type NewEmployeeTimeBlocks = typeof employeeTimeBlocks.$inferInsert
