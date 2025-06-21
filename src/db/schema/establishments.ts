import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "./utils"
import { partners } from "./partners"
import { relations } from "drizzle-orm";

export const establishments = pgTable("establishments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),

  ...lifecycleDates,
})

export const establishmentsRelations = relations(
  establishments,
  ({ one }) => ({
    establishmentPartners: one(partners, {
      fields: [establishments.ownerId],
      references: [partners.id],
      relationName: "partnerEstablishments",
    }),
  }),
);

export type Establishment = typeof establishments.$inferSelect
export type NewEstablishment = typeof establishments.$inferInsert
