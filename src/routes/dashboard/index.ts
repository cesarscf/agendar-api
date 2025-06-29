import { listAppointments } from "@/routes/dashboard/list-appointments"
import type { FastifyInstance } from "fastify"

export async function dashboardRoutes(app: FastifyInstance) {
  await listAppointments(app)
}
