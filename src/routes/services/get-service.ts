import { db } from "@/db"
import { services } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { serviceSchema } from "@/utils/schemas/services"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/services/:id",
      {
        schema: {
          tags: ["Service"],
          summary: "Get establishment service by id",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            200: serviceSchema,
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const service = await db.query.services.findFirst({
          where: and(
            eq(services.establishmentId, establishmentId),
            eq(services.id, id)
          ),
          columns: {
            id: true,
            name: true,
            active: true,
            description: true,
            durationInMinutes: true,
            image: true,
            price: true,
          },
        })

        if (!service) {
          return reply.status(404).send({ message: "Service not found" })
        }

        return reply.status(200).send(service)
      }
    )
}
