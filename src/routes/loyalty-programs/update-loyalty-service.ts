import { db } from "@/db"
import { loyaltyServices } from "@/db/schema/loyalty-services"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function updateLoyaltyService(app: FastifyInstance) {
  app
    .register(auth)
    .register(requireActiveSubscription)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      "/loyalty-programs/:programId/services/:serviceId",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Update points for a service in a loyalty program",
          security: [{ bearerAuth: [] }],
          params: z.object({
            programId: z.string().uuid(),
            serviceId: z.string().uuid(),
          }),
          body: z.object({
            points: z.number().min(0),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { programId, serviceId } = request.params
        const { points } = request.body

        await db
          .update(loyaltyServices)
          .set({ points })
          .where(
            and(
              eq(loyaltyServices.loyaltyProgramId, programId),
              eq(loyaltyServices.serviceId, serviceId)
            )
          )

        return reply.status(204).send()
      }
    )
}
