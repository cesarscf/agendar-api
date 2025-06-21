import { uuid } from "drizzle-orm/pg-core"
import { timestamp } from "drizzle-orm/pg-core"
import { text } from "drizzle-orm/pg-core"
import { pgTable } from "drizzle-orm/pg-core"
import { lifecycleDates } from "./utils"

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  ...lifecycleDates,
})

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
