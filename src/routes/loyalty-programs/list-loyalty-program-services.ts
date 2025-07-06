import { db } from "@/db"
import { loyaltyServices } from "@/db/schema/loyalty-services"
import { services } from "@/db/schema/services"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listLoyaltyProgramServices(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .withTypeProvider<ZodTypeProvider>()
    .get(
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
            points: loyaltyServices.points,
          })
          .from(loyaltyServices)
          .innerJoin(services, eq(loyaltyServices.serviceId, services.id))
          .where(eq(loyaltyServices.loyaltyProgramId, programId))

        return reply.status(200).send(result)
      }
    )
}
