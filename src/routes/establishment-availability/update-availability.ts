import { db } from "@/db"
import { establishmentAvailability } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function updateAvailability(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/availability/:id",
      {
        schema: {
          tags: ["Establishment"],
          summary: "Update specific availability",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            opensAt: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional(),
            closesAt: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional(),
            breakStart: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional()
              .nullable(),
            breakEnd: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional()
              .nullable(),
          }),
          response: {
            200: z.object({ id: z.string().uuid() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const update = request.body

        const result = await db
          .update(establishmentAvailability)
          .set(update)
          .where(
            and(
              eq(establishmentAvailability.id, id),
              eq(establishmentAvailability.establishmentId, establishmentId)
            )
          )
          .returning({ id: establishmentAvailability.id })
          .then(res => res[0])

        if (!result) {
          return reply.status(404).send({ message: "Availability not found" })
        }

        return reply.send(result)
      }
    )
}
