import { relations } from "drizzle-orm"
import { integer, pgTable, uuid } from "drizzle-orm/pg-core"
import { loyaltyPrograms } from "./loyalty-programs"
import { services } from "./services"

export const loyaltyServices = pgTable("loyalty_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  loyaltyProgramId: uuid("loyalty_program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
})

export const loyaltyServicesRelations = relations(
  loyaltyServices,
  ({ one }) => ({
    program: one(loyaltyPrograms, {
      fields: [loyaltyServices.loyaltyProgramId],
      references: [loyaltyPrograms.id],
      relationName: "loyaltyProgramServices",
    }),
    service: one(services, {
      fields: [loyaltyServices.serviceId],
      references: [services.id],
      relationName: "serviceLoyaltyPrograms",
    }),
  })
)

export type LoyaltyService = typeof loyaltyServices.$inferSelect
export type NewLoyaltyService = typeof loyaltyServices.$inferInsert
