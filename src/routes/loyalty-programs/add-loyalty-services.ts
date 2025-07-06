import { db } from "@/db"
import { loyaltyPrograms } from "@/db/schema"
import { loyaltyServices } from "@/db/schema/loyalty-services"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function addLoyaltyServices(app: FastifyInstance) {
  app
    .register(auth)
    .register(requireActiveSubscription)
    .withTypeProvider<ZodTypeProvider>()
    .post(
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
          .delete(loyaltyServices)
          .where(eq(loyaltyServices.loyaltyProgramId, programId))

        await db.insert(loyaltyServices).values(
          uniqueServices.map(s => ({
            loyaltyProgramId: programId,
            serviceId: s.serviceId,
            points: s.points,
          }))
        )

        return reply.status(204).send()
      }
    )
}
