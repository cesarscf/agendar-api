import { db } from "@/db"

import { loyaltyPointRules, loyaltyPrograms } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
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

export async function createLoyaltyProgram(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.post(
      "/loyalty-programs",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Create a loyalty program",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: createLoyaltySchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { requiredPoints, serviceRewardId, rules } = request.body

        const [program] = await db
          .insert(loyaltyPrograms)
          .values({
            establishmentId,
            requiredPoints,
            serviceRewardId,
            active: true,
          })
          .returning()

        await db.insert(loyaltyPointRules).values(
          rules.map(rule => ({
            loyaltyProgramId: program.id,
            serviceId: rule.serviceId,
            points: rule.points,
          }))
        )

        return reply.status(204).send()
      }
    )
  })
}
