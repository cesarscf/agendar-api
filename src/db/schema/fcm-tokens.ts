import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "./utils"

export const fcmTokens = pgTable("push_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().unique(),
  token: text("token").notNull(),
  ...lifecycleDates,
})

export type FcmToken = typeof fcmTokens.$inferSelect
export type NewFcmToken = typeof fcmTokens.$inferInsert
