import { db } from "@/db"

import { loyaltyPointRules, loyaltyPrograms } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

const pointRuleSchema = z.object({
  serviceId: z.string().uuid(),
  points: z.number().int().min(1),
})

const createLoyaltySchema = z.object({
  serviceRewardId: z.string().uuid(),
  requiredPoints: z.number().int().min(1),
  rules: z.array(pointRuleSchema).min(1),
})

export async function updateLoyaltyProgram(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .put(
      "/loyalty-programs/:id",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Update loyalty program",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: createLoyaltySchema,
          params: z.object({ id: z.string().uuid() }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id } = request.params
        const { requiredPoints, serviceRewardId, rules } = request.body

        const program = await db.query.loyaltyPrograms.findFirst({
          where: and(
            eq(loyaltyPrograms.id, id),
            eq(loyaltyPrograms.establishmentId, establishmentId)
          ),
        })

        if (!program) return reply.status(404).send()

        await db
          .update(loyaltyPrograms)
          .set({ requiredPoints, serviceRewardId })
          .where(eq(loyaltyPrograms.id, id))

        await db
          .delete(loyaltyPointRules)
          .where(eq(loyaltyPointRules.loyaltyProgramId, id))

        await db.insert(loyaltyPointRules).values(
          rules.map(rule => ({
            loyaltyProgramId: id,
            serviceId: rule.serviceId,
            points: rule.points,
          }))
        )

        return reply.status(204).send()
      }
    )
}
