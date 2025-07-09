import { cancelSubscription } from "@/routes/subscription/cancel-subscription"
import { getPartnerSubscriptionById } from "@/routes/subscription/get-partner-subscription-byId"
import { listPartnerSubscriptions } from "@/routes/subscription/list-subscriptions"
import type { FastifyInstance } from "fastify"
import { changeSubscriptionPlan } from "./change-subscription-plan"

export async function subscriptionRoutes(app: FastifyInstance) {
  await changeSubscriptionPlan(app)
  await listPartnerSubscriptions(app)
  await getPartnerSubscriptionById(app)
  await cancelSubscription(app)
}
