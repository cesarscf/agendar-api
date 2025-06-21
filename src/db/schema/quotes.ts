import { relations } from "drizzle-orm"

import { decimal, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core"
import { requests } from "./requests"
import { users } from "./users"
import { lifecycleDates } from "./utils"

export const quoteStatusEnum = pgEnum("quote_status", [
  "pending",
  "accepted",
  "rejected",
])

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  status: quoteStatusEnum("status").notNull().default("pending"),

  requestId: uuid("request_id")
    .references(() => requests.id, { onDelete: "cascade" })
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  ...lifecycleDates,
})

export const quotesRelations = relations(quotes, ({ one }) => ({
  author: one(users, {
    fields: [quotes.requestId],
    references: [users.id],
  }),
  request: one(requests, {
    fields: [quotes.requestId],
    references: [requests.id],
    relationName: "requestQuotes",
  }),
}))

export type Quote = typeof requests.$inferSelect
export type NewQuote = typeof requests.$inferInsert
