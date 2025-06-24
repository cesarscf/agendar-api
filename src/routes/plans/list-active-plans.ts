import { db } from "@/db"
import { plans } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listActivePlans(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/plans/active",
    {
      schema: {
        tags: ["Plan"],
        summary: "List all active plans",
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
      const activePlans = await db
        .select()
        .from(plans)
        .where(eq(plans.status, "active"))

      return reply.send(activePlans)
    }
  )
}
