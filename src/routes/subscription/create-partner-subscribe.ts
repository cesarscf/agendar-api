import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import {
  partnerPaymentMethods,
  partners,
  plans,
  subscriptionStatusEnum,
  subscriptions,
} from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createPartnerSubscribe(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/subscriptions/subscribe",
      {
        schema: {
          tags: ["Subscriptions"],
          summary: "Subscribe partner to a plan",
          security: [{ bearerAuth: [] }],
          body: z.object({
            planId: z.string().uuid(),
            cardId: z.string(),
          }),
          response: {
            200: z.object({
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
        const { planId, cardId } = request.body

        const [card] = await db
          .select()
          .from(partnerPaymentMethods)
          .where(
            and(
              eq(partnerPaymentMethods.id, cardId),
              eq(partnerPaymentMethods.partnerId, partnerId)
            )
          )
        if (!card) {
          return reply.status(404).send({ message: "Card not found" })
        }
        const paymentMethodId = card.integrationPaymentMethodId
        const [plan] = await db.select().from(plans).where(eq(plans.id, planId))
        if (!plan) return reply.status(404).send()
        const [partner] = await db
          .select()
          .from(partners)
          .where(eq(partners.id, partnerId))
        if (!partner) return reply.status(404).send()

        const subscriptionAlreadyExists = await db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.partnerId, partnerId),
              eq(subscriptions.status, subscriptionStatusEnum.active),
              eq(subscriptions.planId, planId)
            )
          )

        if (subscriptionAlreadyExists)
          return reply
            .status(400)
            .send({ message: "Partner already subscribed in this plan" })

        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: partner.integrationPaymentId,
        })
        await stripe.customers.update(partner.integrationPaymentId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        })

        const subscription = await stripe.subscriptions.create({
          customer: partner.integrationPaymentId,
          items: [{ price: plan.integrationPriceId }],
          trial_period_days: plan.trialPeriodDays,
          expand: ["latest_invoice.payment_intent", "items.data.price", "plan"],
        })

        const billingAnchor = subscription.billing_cycle_anchor * 1000
        const startDate = new Date(billingAnchor)

        const periodEnd = new Date(startDate)
        periodEnd.setMonth(periodEnd.getMonth() + plan.intervalMonth)

        await db.insert(subscriptions).values({
          partnerId,
          planId,
          integrationSubscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: periodEnd,
        })

        return reply.send({
          status: subscription.status,
          currentPeriodEnd: periodEnd,
        })
      }
    )
}
