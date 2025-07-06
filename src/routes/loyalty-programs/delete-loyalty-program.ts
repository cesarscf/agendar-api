import { db } from "@/db"

import { loyaltyPrograms } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function deleteLoyaltyProgram(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .delete(
      "/loyalty-programs/:id",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Disable loyalty program",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({ id: z.string().uuid() }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id } = request.params

        const program = await db.query.loyaltyPrograms.findFirst({
          where: and(
            eq(loyaltyPrograms.id, id),
            eq(loyaltyPrograms.establishmentId, establishmentId)
          ),
        })

        if (!program) return reply.status(404).send()

        await db
          .update(loyaltyPrograms)
          .set({ active: false })
          .where(eq(loyaltyPrograms.id, id))

        return reply.status(204).send()
      }
    )
}
