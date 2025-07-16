import { db } from "@/db"
import {
  customerLoyaltyPoints,
  loyaltyPointRules,
  loyaltyPrograms,
} from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { customerHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function getLoyaltyByEstablishmentAndService(
  app: FastifyInstance
) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(customerAuth)
    typedApp.get(
      "/loyalty/status",
      {
        schema: {
          tags: ["Loyalty"],
          headers: customerHeaderSchema,
          summary: "Ver pontos acumulados e pontos do serviço",
          querystring: z.object({
            establishmentId: z.string().uuid(),
            serviceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              accumulatedPoints: z.number(),
              servicePoints: z.number().nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId, serviceId } = request.query
        const customerId = await request.getCurrentCustomerId()

        const loyaltyProgram = await db.query.loyaltyPrograms.findFirst({
          where: eq(loyaltyPrograms.establishmentId, establishmentId),
        })

        if (!loyaltyProgram) {
          return reply.send({ accumulatedPoints: 0, servicePoints: null })
        }

        const service = await db.query.loyaltyPointRules.findFirst({
          where: and(
            eq(loyaltyPointRules.loyaltyProgramId, loyaltyProgram.id),
            eq(loyaltyPointRules.serviceId, serviceId)
          ),
        })

        const customerPoints = await db.query.customerLoyaltyPoints.findFirst({
          where: and(
            eq(customerLoyaltyPoints.customerId, customerId),
            eq(customerLoyaltyPoints.loyaltyProgramId, loyaltyProgram.id)
          ),
        })

        return reply.send({
          accumulatedPoints: customerPoints?.points ?? 0,
          servicePoints: service?.points ?? null,
        })
      }
    )
  })
}
