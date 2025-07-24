import { db } from "@/db"
import { subscriptions } from "@/db/schema"
import { ForbiddenError } from "@/routes/_erros/forbidden-request-error"
import { eq } from "drizzle-orm"
import { desc } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import fastifyPlugin from "fastify-plugin"

export const requireActiveSubscription = fastifyPlugin(
  async (app: FastifyInstance) => {
    app.addHook("preHandler", async request => {
      const partnerId = await request.getCurrentPartnerId()
      const [subscription] = await db.query.subscriptions.findMany({
        where: eq(subscriptions.partnerId, partnerId),
        orderBy: [desc(subscriptions.createdAt)],
        limit: 1,
      })

      if (!subscription) {
        throw new ForbiddenError("Não é possível acessar o recurso")
      }

      const now = new Date()

      const isActive =
        subscription.status === "active" || subscription.status === "trialing"

      const notExpired = subscription.currentPeriodEnd > now

      if (!isActive || !notExpired) {
        throw new ForbiddenError("Não é possível acessar o recurso")
      }

      request.getActiveSubscription = () => ({
        ...subscription,
      })
    })
  }
)
