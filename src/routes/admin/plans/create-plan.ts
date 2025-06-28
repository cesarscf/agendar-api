import { createPlanOnStripe } from "@/clients/stripe"
import { db } from "@/db"
import { plans } from "@/db/schema"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export const createPlanSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
  intervalMonth: z.number().min(1).max(12),
  trialPeriodDays: z.number().min(0),
  price: z.number({ message: "Price must be a number 1000 = 10.00" }),
  minimumProfessionalsIncluded: z.number().min(1),
  maximumProfessionalsIncluded: z.number().min(1),
})

export async function createPlan(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/plans",
    {
      schema: {
        tags: ["Plan"],
        summary: "Create plan",
        security: [{ bearerAuth: [] }],
        body: createPlanSchema,
        response: {
          201: z.object({
            id: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        maximumProfessionalsIncluded,
        minimumProfessionalsIncluded,
        price,
        description,
        trialPeriodDays,
        intervalMonth,
      } = request.body
      const { price: stripePrice, product: stripePlan } =
        await createPlanOnStripe(name, price, intervalMonth, trialPeriodDays)
      const plan = await db
        .insert(plans)
        .values({
          name,
          description,
          price: (price / 100).toFixed(2).toString(),
          integrationPriceId: stripePrice.id,
          integrationId: stripePlan.id,
          intervalMonth,
          trialPeriodDays,
          minimumProfessionalsIncluded,
          maximumProfessionalsIncluded,
        })
        .returning({ id: plans.id })

      return reply.status(201).send({ id: plan[0].id })
    }
  )
}
