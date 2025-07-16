import { db } from "@/db"
import { loyaltyPointRules } from "@/db/schema"
import { services } from "@/db/schema/services"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listLoyaltyProgramServices(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.get(
      "/loyalty-programs/:programId/services",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "List services and points of a loyalty program",
          security: [{ bearerAuth: [] }],
          params: z.object({
            programId: z.string().uuid(),
          }),
          response: {
            200: z.array(
              z.object({
                serviceId: z.string().uuid(),
                name: z.string(),
                points: z.number(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const { programId } = request.params

        const result = await db
          .select({
            serviceId: services.id,
            name: services.name,
            points: loyaltyPointRules.points,
          })
          .from(loyaltyPointRules)
          .innerJoin(services, eq(loyaltyPointRules.serviceId, services.id))
          .where(eq(loyaltyPointRules.loyaltyProgramId, programId))

        return reply.status(200).send(result)
      }
    )
  })
}
