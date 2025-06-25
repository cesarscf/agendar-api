import { db } from "@/db"
import { services } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { serviceSchema } from "@/utils/schemas/services"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

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
            201: serviceSchema,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const service = await db.query.services.findFirst({
          where: eq(services.establishmentId, establishmentId),
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
          throw new BadRequestError("Service not found")
        }

        return reply.status(201).send(service)
      }
    )
}
