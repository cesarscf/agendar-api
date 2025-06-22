import { packages } from "@/db/schema/packages"
import { services } from "@/db/schema/services"
import { relations } from "drizzle-orm"
import { integer, pgTable, uuid } from "drizzle-orm/pg-core"

export const packageItems = pgTable("package_items", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
})
export const packageItemsRelations = relations(packageItems, ({ one }) => ({
  package: one(packages, {
    fields: [packageItems.packageId],
    references: [packages.id],
    relationName: "packagePackageItems",
  }),
  service: one(services, {
    fields: [packageItems.serviceId],
    references: [services.id],
    relationName: "servicePackageItems",
  }),
}))
export type PackageItems = typeof packageItems.$inferSelect
export type NewServicePackageItems = typeof packageItems.$inferInsert
