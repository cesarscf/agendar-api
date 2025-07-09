import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { subscriptions } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function cancelSubscription(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .delete(
      "/subscriptions/cancel",
      {
        schema: {
          tags: ["Subscriptions"],
          summary: "Cancel partner's current subscription",
          security: [{ bearerAuth: [] }],
          querystring: z.object({
            atPeriodEnd: z.boolean().optional().default(true), // cancelar no fim do ciclo por padrão
          }),
          response: {
            204: z.null(),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()
        const { atPeriodEnd } = request.query

        const [subscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.partnerId, partnerId))

        if (!subscription) {
          return reply.status(404).send({ message: "Subscription not found." })
        }

        await stripe.subscriptions.update(
          subscription.integrationSubscriptionId,
          {
            cancel_at_period_end: atPeriodEnd,
          }
        )

        await db
          .update(subscriptions)
          .set({
            status: atPeriodEnd ? "active" : "canceled",
            endedAt: atPeriodEnd ? null : new Date(),
          })
          .where(eq(subscriptions.id, subscription.id))

        return reply.status(204).send()
      }
    )
}
