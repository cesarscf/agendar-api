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

export async function getByIdLoyaltyProgram(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.get(
      "/loyalty-programs/:id",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Get a loyalty program",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({ id: z.string().uuid() }),
          response: {
            200: z
              .object({
                id: z.string().uuid(),
                serviceRewardId: z.string().uuid(),
                requiredPoints: z.number(),
                active: z.boolean(),
                rules: z.array(pointRuleSchema),
              })
              .nullable(),
          },
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

        if (!program) return reply.send(null)

        const rules = await db.query.loyaltyPointRules.findMany({
          where: eq(loyaltyPointRules.loyaltyProgramId, program.id),
        })

        return reply.send({ ...program, rules })
      }
    )
  })
}
