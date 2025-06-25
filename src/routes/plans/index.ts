import { createPlan } from "@/routes/plans/create-plan"
import { getPlanById } from "@/routes/plans/get-plan-by-id"
import { listActivePlans } from "@/routes/plans/list-active-plans"
import { updatePlanStatus } from "@/routes/plans/update-plan-status"
import type { FastifyInstance } from "fastify"

export async function planRoutes(app: FastifyInstance) {
  await createPlan(app)
  await listActivePlans(app)
  await getPlanById(app)
  await updatePlanStatus(app)
}
