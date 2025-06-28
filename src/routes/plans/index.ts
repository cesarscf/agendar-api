import { getPlanById } from "@/routes/plans/get-plan-by-id"
import { listActivePlans } from "@/routes/plans/list-active-plans"
import type { FastifyInstance } from "fastify"

export async function planRoutes(app: FastifyInstance) {
  await listActivePlans(app)
  await getPlanById(app)
}
