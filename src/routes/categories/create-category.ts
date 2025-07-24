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

export async function createCategory(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.post(
      "/categories",
      {
        schema: {
          tags: ["Category"],
          summary: "Create category",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: categorySchema.omit({ id: true }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { name } = request.body

        const categoryWithSameName = await db.query.categories.findFirst({
          where: and(
            eq(categories.establishmentId, establishmentId),
            eq(categories.name, name)
          ),
          columns: {
            id: true,
            name: true,
          },
        })

        if (categoryWithSameName) {
          throw new BadRequestError("A category with this name already exists.")
        }

        await db.insert(categories).values({
          name,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
  })
}
