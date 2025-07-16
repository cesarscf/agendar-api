import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { partners } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getSetupIntent(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/payment-methods/setup-intent",
      {
        schema: {
          tags: ["Payment Methods"],
          summary: "Generate SetupIntent to add a card",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              clientSecret: z.string(),
            }),
            500: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()

        const [partner] = await db
          .select()
          .from(partners)
          .where(eq(partners.id, partnerId))

        if (!partner) return reply.status(404).send()

        const setupIntent = await stripe.setupIntents.create({
          customer: partner.integrationPaymentId,
          usage: "off_session",
        })
        if (!setupIntent.client_secret)
          return reply
            .status(500)
            .send({ message: "Failed to generate SetupIntent" })

        return reply.send({ clientSecret: setupIntent.client_secret })
      }
    )
  })
}
