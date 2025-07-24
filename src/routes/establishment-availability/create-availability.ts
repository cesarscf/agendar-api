import { db } from "@/db"
import { establishmentAvailability } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

const availabilitySchema = z.object({
  availability: z.array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      opensAt: z.string().regex(/^\d{2}:\d{2}$/),
      closesAt: z.string().regex(/^\d{2}:\d{2}$/),
      breakStart: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
      breakEnd: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
    })
  ),
})

export async function createAvailability(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.post(
      "/establishments/availability",
      {
        schema: {
          tags: ["Establishment"],
          summary: "Create or replace availability",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: availabilitySchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const availability = request.body.availability

        await db
          .delete(establishmentAvailability)
          .where(eq(establishmentAvailability.establishmentId, establishmentId))
        await db.insert(establishmentAvailability).values(
          availability.map(a => ({
            establishmentId,
            ...a,
          }))
        )

        return reply.status(204).send()
      }
    )
  })
}
