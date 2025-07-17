import { adminAuth } from "@/middlewares/admin-auth"
import { createPlan } from "@/routes/admin/plans/create-plan"
import { listPlans } from "@/routes/admin/plans/list-plans"
import { updatePlanStatus } from "@/routes/admin/plans/update-plan-status"
import { adminReports } from "@/routes/admin/reports"
import { sendTestPushRoute } from "@/routes/admin/send-push-token"
import type { FastifyInstance } from "fastify"

export async function adminRoutes(app: FastifyInstance) {
  app.register(adminAuth)
  // await createAdmin(app)
  await createPlan(app)
  await updatePlanStatus(app)
  await listPlans(app)
  await sendTestPushRoute(app)
  await adminReports(app)
}
