import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { customers } from "./customers"
import { quotes } from "./quotes"
import { lifecycleDates } from "./utils"

export const requestStatusEnum = pgEnum("request_status", [
  "open",
  "closed",
  "canceled",
])

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),
  description: text("description"),
  cep: text("cep").notNull(),
  status: requestStatusEnum("status").notNull().default("open"),

  authorId: uuid("author_id")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),

  ...lifecycleDates,
})

export const requestsRelations = relations(requests, ({ many, one }) => ({
  author: one(customers, {
    fields: [requests.authorId],
    references: [customers.id],
  }),
  quotes: many(quotes, { relationName: "requestQuotes" }),
}))

export type Request = typeof requests.$inferSelect
export type NewRequest = typeof requests.$inferInsert
