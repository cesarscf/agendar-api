import { updatePlanStatusOnStripe } from "@/clients/stripe"
import { db } from "@/db"
import { plans } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function updatePlanStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/plans/:id/status",
    {
      schema: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Update plan status",
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          status: z.enum(["active", "inactive"]),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            status: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { status } = request.body
      const isActive = status === "active"
      const plan = await db
        .select({
          id: plans.id,
          integrationId: plans.integrationId,
        })
        .from(plans)
        .where(eq(plans.id, id))
        .then(res => res[0])
      if (!plan) {
        return reply.status(404).send({ message: "Plan not found" })
      }
      await updatePlanStatusOnStripe(plan.integrationId, isActive)
      const updated = await db
        .update(plans)
        .set({ status })
        .where(eq(plans.id, id))
        .returning({ id: plans.id, status: plans.status })
        .then(res => res[0])

      return reply.send(updated)
    }
  )
}
