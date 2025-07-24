import { db } from "@/db"
import { categories } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { categorySchema } from "@/utils/schemas/categories"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"

import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function getCategory(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/categories/:id",
      {
        schema: {
          tags: ["Category"],
          summary: "Get establishment category by id",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            200: categorySchema,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id: categoryId } = request.params

        const data = await db.query.categories.findFirst({
          where: and(
            eq(categories.id, categoryId),
            eq(categories.establishmentId, establishmentId)
          ),
        })

        if (!data) {
          throw new BadRequestError("Category not found")
        }

        return reply.status(200).send(data)
      }
    )
  })
}
