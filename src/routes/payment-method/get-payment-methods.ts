import { db } from "@/db"
import { partnerPaymentMethods } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { desc, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listPartnerPaymentMethods(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/payment-methods",
      {
        schema: {
          tags: ["Payment Methods"],
          summary: "List partner payment methods",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                brand: z.string(),
                last4: z.string(),
                expMonth: z.number(),
                expYear: z.number(),
                isDefault: z.boolean(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()

        const methods = await db
          .select({
            id: partnerPaymentMethods.id,
            brand: partnerPaymentMethods.brand,
            last4: partnerPaymentMethods.last4,
            expMonth: partnerPaymentMethods.expMonth,
            expYear: partnerPaymentMethods.expYear,
            isDefault: partnerPaymentMethods.isDefault,
          })
          .from(partnerPaymentMethods)
          .where(eq(partnerPaymentMethods.partnerId, partnerId))
          .orderBy(desc(partnerPaymentMethods.createdAt))

        return reply.send(methods)
      }
    )
}
