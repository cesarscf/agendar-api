import { db } from "@/db"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function getPartnerSubscriptionById(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/subscriptions/:subscriptionId",
      {
        schema: {
          tags: ["Subscriptions"],
          summary: "Get a single subscription by ID",
          security: [{ bearerAuth: [] }],
          params: z.object({
            subscriptionId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              id: z.string().uuid(),
              status: z.string(),
              currentPeriodEnd: z.date(),
              endedAt: z.date().nullable(),
              integrationSubscriptionId: z.string(),
              plan: z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                price: z.string(),
              }),
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()
        const { subscriptionId } = request.params

        const subscription = await db.query.subscriptions.findFirst({
          where: subs =>
            and(eq(subs.id, subscriptionId), eq(subs.partnerId, partnerId)),
          with: {
            plan: {
              columns: {
                id: true,
                name: true,
                description: true,
                price: true,
              },
            },
          },
        })

        console.log(subscription)

        if (!subscription) {
          return reply.status(404).send({ message: "Subscription not found" })
        }

        return reply.send({
          ...subscription,
          plan: {
            ...subscription.plan,
            price: subscription.plan.price.toString(),
          },
        })
      }
    )
}
