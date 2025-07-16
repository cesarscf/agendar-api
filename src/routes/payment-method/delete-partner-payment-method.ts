import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { partnerPaymentMethods } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function deletePartnerPaymentMethod(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.delete(
      "/payment-methods/:id",
      {
        schema: {
          tags: ["Payment Methods"],
          security: [{ bearerAuth: [] }],
          summary: "Delete a payment method",
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()
        const { id } = request.params
        const [method] = await db
          .select()
          .from(partnerPaymentMethods)
          .where(eq(partnerPaymentMethods.id, id))

        if (!method || method.partnerId !== partnerId) {
          return reply.status(404).send()
        }
        await stripe.paymentMethods.detach(method.integrationPaymentMethodId)
        await db
          .delete(partnerPaymentMethods)
          .where(eq(partnerPaymentMethods.id, id))

        return reply.status(204).send()
      }
    )
  })
}
