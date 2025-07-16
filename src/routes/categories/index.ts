import type {FastifyInstance} from "fastify";
import {updateCategory} from "@/routes/categories/update-category";
import {getCategories} from "@/routes/categories/get-categories";
import {deleteCategory} from "@/routes/categories/delete-category";
import {createCategory} from "@/routes/categories/create-category";

export async function categoriesRoutes(app: FastifyInstance) {
    await updateCategory(app)
    await getCategories(app)
    await deleteCategory(app)
    await createCategory(app)
}
