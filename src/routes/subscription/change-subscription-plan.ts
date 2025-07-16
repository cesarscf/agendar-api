import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { plans, subscriptions } from "@/db/schema"
import { subscriptionStatusEnum } from "@/db/schema/subscriptions"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function changeSubscriptionPlan(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.patch(
      "/subscriptions/change-plan",
      {
        schema: {
          tags: ["Subscriptions"],
          summary: "Change subscription plan",
          security: [{ bearerAuth: [] }],
          body: z.object({
            newPlanId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              newPlanName: z.string(),
              status: z.string(),
              currentPeriodEnd: z.date(),
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()
        const { newPlanId } = request.body

        const [subscriptionRecord] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.partnerId, partnerId))

        if (!subscriptionRecord)
          return reply.status(404).send({ message: "No subscription found." })

        const [newPlan] = await db
          .select()
          .from(plans)
          .where(eq(plans.id, newPlanId))
        if (!newPlan)
          return reply.status(404).send({ message: "Plan not found." })

        const stripeSub = await stripe.subscriptions.retrieve(
          subscriptionRecord.integrationSubscriptionId
        )

        const updated = await stripe.subscriptions.update(
          subscriptionRecord.integrationSubscriptionId,
          {
            items: [
              {
                id: stripeSub.items.data[0].id,
                price: newPlan.integrationPriceId,
              },
            ],
            proration_behavior: "create_prorations",
          }
        )

        const billingAnchor = updated.billing_cycle_anchor * 1000
        const startDate = new Date(billingAnchor)
        const newPeriodEnd = new Date(startDate)
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + newPlan.intervalMonth)

        const newSubscriptions = await db
          .insert(subscriptions)
          .values({
            partnerId,
            planId: newPlan.id,
            integrationSubscriptionId:
              subscriptionRecord.integrationSubscriptionId,
            status: updated.status,
            currentPeriodEnd: newPeriodEnd,
          })
          .returning({ id: subscriptions.id })

        await db
          .update(subscriptions)
          .set({
            status: subscriptionStatusEnum.canceled,
            endedAt: new Date(),
            changedFromSubscriptionId: newSubscriptions[0].id,
          })
          .where(eq(subscriptions.id, subscriptionRecord.id))

        return reply.send({
          newPlanName: newPlan.name,
          status: updated.status,
          currentPeriodEnd: newPeriodEnd,
        })
      }
    )
  })
}
