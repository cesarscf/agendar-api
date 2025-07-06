import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { partners, subscriptions } from "@/db/schema"
import { partnerPaymentMethods } from "@/db/schema/partner-payment-methods"
import { env } from "@/env"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type Stripe from "stripe"

export async function stripeWebhook(app: FastifyInstance) {
  app.post(
    "/webhook/stripe",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const sig = request.headers["stripe-signature"]
      if (!sig)
        return reply
          .status(400)
          .send({ message: "Missing stripe-signature header" })
      const rawBody = request.rawBody
      if (!rawBody) {
        return reply.status(400).send({ message: "Missing raw body" })
      }
      let event: Stripe.Event

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        )
      } catch (err) {
        return reply.status(400).send(`Webhook error: ${err}`)
      }

      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription
          const currentPeriodEnd = sub.ended_at ? sub.ended_at * 1000 : 1000
          await db
            .update(subscriptions)
            .set({
              status: sub.status,
              currentPeriodEnd: new Date(currentPeriodEnd),
            })
            .where(eq(subscriptions.integrationSubscriptionId, sub.id))

          break
        }
        case "setup_intent.succeeded": {
          const intent = event.data.object as Stripe.SetupIntent

          const paymentMethodId = intent.payment_method as string
          const customerId = intent.customer as string

          const paymentMethod =
            await stripe.paymentMethods.retrieve(paymentMethodId)

          const [partner] = await db
            .select()
            .from(partners)
            .where(eq(partners.integrationPaymentId, customerId))

          if (!partner) return reply.status(404).send()
          const card = paymentMethod.card
          if (!card) return reply.status(400).send()

          await db
            .update(partnerPaymentMethods)
            .set({ isDefault: false })
            .where(eq(partnerPaymentMethods.partnerId, partner.id))

          await db.insert(partnerPaymentMethods).values({
            partnerId: partner.id,
            integrationPaymentMethodId: paymentMethod.id,
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            isDefault: true,
          })

          break
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice & {
            subscription?: string
          }

          const subscriptionId = invoice.subscription as string

          await db
            .update(subscriptions)
            .set({ status: "unpaid" })
            .where(eq(subscriptions.integrationSubscriptionId, subscriptionId))
          break
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice & {
            subscription?: string
          }
          const subscriptionId = invoice.subscription as string

          await db
            .update(subscriptions)
            .set({ status: "active" })
            .where(eq(subscriptions.integrationSubscriptionId, subscriptionId))
          break
        }
        default:
          console.log(`Unhandled event type ${event.type}`)
          break
      }

      return reply.status(204).send()
    }
  )
}
