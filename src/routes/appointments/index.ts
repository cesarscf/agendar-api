import type { FastifyInstance } from "fastify"

import { createAppointment } from "@/routes/appointments/create-appointment"
import { updateAppointmentStatus } from "@/routes/appointments/update-appointment-status"
import { createAppointmentUsingPackage } from "@/routes/appointments/use-package"

export async function appointments(app: FastifyInstance) {
  await createAppointment(app)
  await createAppointmentUsingPackage(app)
  await updateAppointmentStatus(app)
}
