import { relations } from "drizzle-orm"
import { integer, pgTable, time, uuid } from "drizzle-orm/pg-core"
import { uniqueIndex } from "drizzle-orm/pg-core"
import { establishments } from "./establishments"

export const establishmentAvailability = pgTable(
  "establishment_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    establishmentId: uuid("establishment_id")
      .notNull()
      .references(() => establishments.id, { onDelete: "cascade" }),

    weekday: integer("weekday").notNull(), // 0 = domingo, 1 = segunda, ..., 6 = sábado

    opensAt: time("opens_at").notNull(),
    closesAt: time("closes_at").notNull(),

    breakStart: time("break_start"),
    breakEnd: time("break_end"),
  },
  table => ({
    uniqueEstablishmentDay: uniqueIndex("establishment_day_unique").on(
      table.establishmentId,
      table.weekday
    ),
  })
)

export const relationsEstablishmentAvailability = relations(
  establishmentAvailability,
  ({ one }) => ({
    establishment: one(establishments, {
      fields: [establishmentAvailability.establishmentId],
      references: [establishments.id],
    }),
  })
)

export type EstablishmentAvailability =
  typeof establishmentAvailability.$inferSelect
export type NewEstablishmentAvailability =
  typeof establishmentAvailability.$inferInsert
