import { adminAuth } from "@/middlewares/admin-auth"
import { createPlan } from "@/routes/admin/plans/create-plan"
import { listPlans } from "@/routes/admin/plans/list-plans"
import { updatePlanStatus } from "@/routes/admin/plans/update-plan-status"
import type { FastifyInstance } from "fastify"

export async function adminRoutes(app: FastifyInstance) {
  app.register(adminAuth)
  await createPlan(app)
  await updatePlanStatus(app)
  await listPlans(app)
}
