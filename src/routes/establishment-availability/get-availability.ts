import { db } from "@/db"
import { establishmentAvailability } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getAvailability(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/establishments/availability",
      {
        schema: {
          tags: ["Establishment"],
          summary: "Get availability by establishment",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                weekday: z.number(),
                opensAt: z.string(),
                closesAt: z.string(),
                breakStart: z.string().nullable(),
                breakEnd: z.string().nullable(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = await db
          .select()
          .from(establishmentAvailability)
          .where(eq(establishmentAvailability.establishmentId, establishmentId))

        return reply.send(data)
      }
    )
  })
}
