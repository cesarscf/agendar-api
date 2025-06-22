import { employees } from "@/db/schema/employees"
import { packages } from "@/db/schema/packages"
import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { categories } from "./categories"
import { partners } from "./partners"
import { lifecycleDates } from "./utils"

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
  ({ one, many }) => ({
    establishmentPartners: one(partners, {
      fields: [establishments.ownerId],
      references: [partners.id],
      relationName: "partnerEstablishments",
    }),
    servicePackages: many(packages, {
      relationName: "establishmentServicePackages",
    }),
    categories: many(categories, { relationName: "establishmentCategories" }),
    employees: many(employees, { relationName: "establishmentEmployees" }),
  })
)

export type Establishment = typeof establishments.$inferSelect
export type NewEstablishment = typeof establishments.$inferInsert
