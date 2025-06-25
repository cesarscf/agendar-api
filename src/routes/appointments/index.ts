import type { FastifyInstance } from "fastify"

import { createAppointment } from "@/routes/appointments/create-appointment"
import { createAppointmentUsingPackage } from "@/routes/appointments/use-package"

export async function appointments(app: FastifyInstance) {
  await createAppointment(app)
  await createAppointmentUsingPackage(app)
}
