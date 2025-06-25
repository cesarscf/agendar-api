import { db } from "@/db"
import { establishmentAvailability } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function deleteAvailability(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/availability/:id",
      {
        schema: {
          tags: ["Availability"],
          summary: "Delete availability by ID",
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
            403: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const availability = await db
          .select({
            id: establishmentAvailability.id,
            establishmentId: establishmentAvailability.establishmentId,
          })
          .from(establishmentAvailability)
          .where(eq(establishmentAvailability.id, id))
          .then(res => res[0])

        if (!availability) {
          return reply.status(404).send({ message: "Availability not found" })
        }

        if (availability.establishmentId !== establishmentId) {
          return reply.status(403).send({ message: "Unauthorized" })
        }

        await db
          .delete(establishmentAvailability)
          .where(eq(establishmentAvailability.id, id))

        return reply.status(204).send()
      }
    )
}
