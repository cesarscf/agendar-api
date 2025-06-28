import { cancelSubscription } from "@/routes/subscription/cancel-subscription"
import { createPartnerSubscribe } from "@/routes/subscription/create-partner-subscribe"
import { stripeWebhook } from "@/routes/subscription/stripe-webhook"
import type { FastifyInstance } from "fastify"
import { changeSubscriptionPlan } from "./change-subscription-plan"

export async function subscriptionRoutes(app: FastifyInstance) {
  await changeSubscriptionPlan(app)
  await stripeWebhook(app)
  await createPartnerSubscribe(app)
  await cancelSubscription(app)
}
