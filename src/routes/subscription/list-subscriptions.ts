import { db } from "@/db"
import { subscriptions } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listPartnerSubscriptions(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/subscriptions",
      {
        schema: {
          tags: ["Subscription"],
          summary: "List all subscriptions of the authenticated partner",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.array(
              z.object({
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
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()

        const results = await db.query.subscriptions.findMany({
          where: eq(subscriptions.partnerId, partnerId),
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
          orderBy: (subs, { desc }) => [desc(subs.createdAt)],
        })

        return reply.send(results)
      }
    )
}
