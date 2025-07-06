import { relations } from "drizzle-orm"
import { boolean, integer, pgTable, uuid } from "drizzle-orm/pg-core"
import { establishments } from "./establishments"
import { loyaltyPointRules } from "./loyalty-point-rules"
import { services } from "./services"
import { lifecycleDates } from "./utils"

export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  serviceRewardId: uuid("service_reward_id")
    .notNull()
    .references(() => services.id),
  requiredPoints: integer("required_points").notNull(),
  active: boolean("active").notNull().default(true),
  ...lifecycleDates,
})

export const loyaltyProgramsRelations = relations(
  loyaltyPrograms,
  ({ one, many }) => ({
    establishment: one(establishments, {
      fields: [loyaltyPrograms.establishmentId],
      references: [establishments.id],
      relationName: "loyaltyProgramEstablishment",
    }),
    rewardService: one(services, {
      fields: [loyaltyPrograms.serviceRewardId],
      references: [services.id],
      relationName: "loyaltyProgramRewardService",
    }),
    rules: many(loyaltyPointRules, {
      relationName: "loyaltyProgramRules",
    }),
  })
)
