import { createCategory } from "@/routes/categories/create-category"
import { deleteCategory } from "@/routes/categories/delete-category"
import { getCategories } from "@/routes/categories/get-categories"
import { updateCategory } from "@/routes/categories/update-category"
import type { FastifyInstance } from "fastify"
import { getCategory } from "./get-category"

export async function categoriesRoutes(app: FastifyInstance) {
  await updateCategory(app)
  await getCategories(app)
  await getCategory(app)
  await deleteCategory(app)
  await createCategory(app)
}
