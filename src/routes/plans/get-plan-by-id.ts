import { db } from "@/db"
import { plans } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getPlanById(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/plans/:id",
    {
      schema: {
        tags: ["Plan"],
        summary: "Get plan by ID",
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            price: z.string(),
            intervalMonth: z.number(),
            trialPeriodDays: z.number(),
            minimumProfessionalsIncluded: z.number(),
            maximumProfessionalsIncluded: z.number(),
            status: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      console.log({ id })
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.id, id))
        .then(res => res[0])

      console.log({ plan })

      if (!plan) {
        return reply.status(404).send({ message: "Plan not found" })
      }

      return reply.send(plan)
    }
  )
}
