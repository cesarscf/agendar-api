import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { requests } from "./requests"
import { lifecycleDates } from "./utils"

export const customers = pgTable("customers", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),

  ...lifecycleDates,
})

export const customersRelations = relations(customers, ({ many }) => ({
  requests: many(requests, {
    relationName: "customerRequests",
  }),
}))

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
