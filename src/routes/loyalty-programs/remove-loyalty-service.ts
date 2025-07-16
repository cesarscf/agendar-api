import { db } from "@/db"
import { loyaltyPointRules } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function removeLoyaltyService(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.delete(
      "/loyalty-programs/:programId/services/:serviceId",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Remove a service from a loyalty program",
          security: [{ bearerAuth: [] }],
          params: z.object({
            programId: z.string().uuid(),
            serviceId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { programId, serviceId } = request.params

        await db
          .delete(loyaltyPointRules)
          .where(
            and(
              eq(loyaltyPointRules.loyaltyProgramId, programId),
              eq(loyaltyPointRules.serviceId, serviceId)
            )
          )

        return reply.status(204).send()
      }
    )
  })
}
