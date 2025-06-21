import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "./utils"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").unique(),
  cep: text("cep"),

  ...lifecycleDates,
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
