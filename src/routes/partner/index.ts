import { createPartner } from "@/routes/partner/create-partner"
import { getPartner } from "@/routes/partner/get-partner"
import { login } from "@/routes/partner/login"
import { partnerReports } from "@/routes/partner/reports"
import type { FastifyInstance } from "fastify"
import { logout } from "./logout"

export async function partnerRoutes(app: FastifyInstance) {
  await createPartner(app)
  await login(app)
  await getPartner(app)
  await partnerReports(app)
  await logout(app)
}
