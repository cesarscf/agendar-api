import { categories } from "@/db/schema/categories"
import { services } from "@/db/schema/services"
import { lifecycleDates } from "@/db/schema/utils"
import { relations } from "drizzle-orm"
import { pgTable, uuid } from "drizzle-orm/pg-core"

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  ...lifecycleDates,
})

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceCategories.serviceId],
      references: [services.id],
      relationName: "servicesServiceCategories",
    }),
    category: one(categories, {
      fields: [serviceCategories.categoryId],
      references: [categories.id],
      relationName: "categoriesServiceCategories",
    }),
  })
)

export type ServiceCategories = typeof serviceCategories.$inferSelect
export type NewServiceCategories = typeof serviceCategories.$inferInsert
