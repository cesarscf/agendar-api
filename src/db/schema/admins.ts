import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "./utils"

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  ...lifecycleDates,
})

export type Admin = typeof admins.$inferSelect
export type NewAdmin = typeof admins.$inferInsert
