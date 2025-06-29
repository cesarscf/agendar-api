import { createService } from "@/routes/services/create-services"
import { deleteService } from "@/routes/services/delete-service"
import { getServices } from "@/routes/services/get-services"
import { updateService } from "@/routes/services/update-service"
import { UpdateServiceStatus } from "@/routes/services/update-service-status"
import type { FastifyInstance } from "fastify"

export async function servicesRoutes(app: FastifyInstance) {
  await getServices(app)
  await updateService(app)
  await deleteService(app)
  await createService(app)
  await UpdateServiceStatus(app)
}
