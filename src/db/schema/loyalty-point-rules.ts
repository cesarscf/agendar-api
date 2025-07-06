import { relations } from "drizzle-orm"
import { integer, pgTable, uuid } from "drizzle-orm/pg-core"
import { loyaltyPrograms } from "./loyalty-programs"
import { services } from "./services"
import { lifecycleDates } from "./utils"

export const loyaltyPointRules = pgTable("loyalty_point_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  loyaltyProgramId: uuid("loyalty_program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  points: integer("points").notNull(),
  ...lifecycleDates,
})

export const loyaltyPointRulesRelations = relations(
  loyaltyPointRules,
  ({ one }) => ({
    program: one(loyaltyPrograms, {
      fields: [loyaltyPointRules.loyaltyProgramId],
      references: [loyaltyPrograms.id],
      relationName: "loyaltyProgramRules",
    }),
    service: one(services, {
      fields: [loyaltyPointRules.serviceId],
      references: [services.id],
      relationName: "servicePointRules",
    }),
  })
)
