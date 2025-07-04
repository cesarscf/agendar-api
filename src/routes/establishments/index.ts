import { updateEstablishment } from "@/routes/establishments/update-establishment"
import type { FastifyInstance } from "fastify"

export async function establishmentsRoutes(app: FastifyInstance) {
  await updateEstablishment(app)
}
