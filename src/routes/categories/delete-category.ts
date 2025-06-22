import { db } from "@/db"
import { categories } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function updateCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/categories/:id",
      {
        schema: {
          tags: ["Category"],
          summary: "Delete category",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: categoryId } = request.params

        const category = await db.query.categories.findFirst({
          where: and(
            eq(categories.establishmentId, establishmentId),
            eq(categories.id, categoryId)
          ),
          columns: {
            id: true,
            name: true,
          },
        })

        if (!category) {
          throw new BadRequestError("Category not found")
        }

        await db
          .delete(categories)
          .where(
            and(
              eq(categories.id, categoryId),
              eq(categories.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
