import { db } from "@/db"
import { loyaltyPointRules, loyaltyPrograms } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function addLoyaltyServices(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.post(
      "/loyalty-programs/:programId/services",
      {
        schema: {
          tags: ["Loyalty"],
          summary: "Add services to a loyalty program",
          security: [{ bearerAuth: [] }],
          params: z.object({
            programId: z.string().uuid(),
          }),
          body: z.object({
            services: z
              .array(
                z.object({
                  serviceId: z.string().uuid(),
                  points: z.number().int().min(1),
                })
              )
              .min(1),
          }),
          response: {
            204: z.null(),
            404: z.object({
              message: z.string(),
            }),
            500: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { programId } = request.params
        const { services } = request.body
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const program = await db.query.loyaltyPrograms.findFirst({
          where: and(
            eq(loyaltyPrograms.id, programId),
            eq(loyaltyPrograms.establishmentId, establishmentId)
          ),
        })
        if (!program)
          return reply.status(404).send({ message: "Program not found" })

        const uniqueServices = Array.from(
          new Map(services.map(s => [s.serviceId, s])).values()
        )

        await db
          .delete(loyaltyPointRules)
          .where(eq(loyaltyPointRules.loyaltyProgramId, programId))

        await db.insert(loyaltyPointRules).values(
          uniqueServices.map(s => ({
            loyaltyProgramId: programId,
            serviceId: s.serviceId,
            points: s.points,
          }))
        )

        return reply.status(204).send()
      }
    )
  })
}
