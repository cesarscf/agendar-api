import { db } from "@/db"
import { services } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { serviceSchema } from "@/utils/schemas/services"
import {} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createService(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.post(
      "/services",
      {
        schema: {
          tags: ["Service"],
          summary: "Create services",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: serviceSchema.omit({ id: true }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        await db.insert(services).values({
          ...data,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
  })
}
