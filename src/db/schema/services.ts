import { establishments } from "@/db/schema/establishments"
import { packageItems } from "@/db/schema/package-items"
import { serviceCategories } from "@/db/schema/services-categories"
import { lifecycleDates } from "@/db/schema/utils"
import { relations } from "drizzle-orm"
import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

export const services = pgTable("services", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  durationInMinutes: integer("duration_in_minutes").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  image: text("image"),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  description: text("description"),
  ...lifecycleDates,
})

export const servicesRelations = relations(services, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [services.establishmentId],
    references: [establishments.id],
    relationName: "establishmentServices",
  }),
  categories: many(serviceCategories, {
    relationName: "serviceServiceCategories",
  }),
  serviceServicePackageItems: many(packageItems, {
    relationName: "servicePackageItems",
  }),
}))

export type Services = typeof services.$inferSelect
export type NewServices = typeof services.$inferInsert

export const serviceToCategories = pgTable("service_to_categories", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id, { onDelete: "cascade" }),
})

export type ServiceToCategories = typeof serviceToCategories.$inferSelect
export type NewServiceToCategories = typeof serviceToCategories.$inferInsert
