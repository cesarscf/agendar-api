import { createPartner } from "@/routes/partner/create-partner"
import { getPartner } from "@/routes/partner/get-partner"
import { login } from "@/routes/partner/login"
import type { FastifyInstance } from "fastify"

export async function partnerRoutes(app: FastifyInstance) {
  await createPartner(app)
  await login(app)
  await getPartner(app)
}
