import { db } from "@/db"
import { categories } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/categories",
      {
        schema: {
          tags: ["Category"],
          summary: "Get establishment categories",
          security: [{ bearerAuth: [] }],
          response: {
            201: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.categories.findMany({
          where: eq(categories.establishmentId, establishmentId),
          columns: {
            id: true,
            name: true,
          },
        })

        return reply.status(201).send(result)
      }
    )
}
