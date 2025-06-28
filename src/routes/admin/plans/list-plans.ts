import { db } from "@/db"
import { plans } from "@/db/schema"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listPlans(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/plans",
    {
      schema: {
        tags: ["Plan"],
        summary: "List all plans",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string(),
              price: z.string(),
              intervalMonth: z.number(),
              trialPeriodDays: z.number(),
              minimumProfessionalsIncluded: z.number(),
              maximumProfessionalsIncluded: z.number(),
              status: z.string(),
            })
          ),
        },
      },
    },
    async (_request, reply) => {
      const activePlans = await db.select().from(plans)
      return reply.send(activePlans)
    }
  )
}
