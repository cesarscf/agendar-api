import { appointments } from "@/db/schema/appointments"
import { customers } from "@/db/schema/customers"
import { establishments } from "@/db/schema/establishments"
import { packageItems } from "@/db/schema/package-items"
import { lifecycleDates } from "@/db/schema/utils"
import { relations } from "drizzle-orm"
import { boolean, decimal, pgTable, text, uuid } from "drizzle-orm/pg-core"

export const packages = pgTable("packages", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  description: text("description"),
  image: text("image"),
  ...lifecycleDates,
})

export const packagesRelations = relations(packages, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [packages.establishmentId],
    references: [establishments.id],
    relationName: "establishmentServicePackages",
  }),
  packageItems: many(packageItems, {
    relationName: "packagePackageItems",
  }),
  appointments: many(appointments, {
    relationName: "servicePackageAppointments",
  }),
  customers: many(customers, {
    relationName: "servicePackageCustomers",
  }),
}))

export type ServicePackages = typeof packages.$inferSelect
export type NewServicePackages = typeof packages.$inferInsert
