import { db } from "@/db"

import { services } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function deleteService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/services/:id",
      {
        schema: {
          tags: ["Service"],
          summary: "Delete service",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
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

        const { id: serviceId } = request.params

        const serviceExists = await db.query.services.findFirst({
          where: and(
            eq(services.establishmentId, establishmentId),
            eq(services.id, serviceId)
          ),
          columns: {
            id: true,
          },
        })

        if (!serviceExists) {
          throw new BadRequestError("Service not found")
        }

        await db
          .delete(services)
          .where(
            and(
              eq(services.id, serviceId),
              eq(services.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
