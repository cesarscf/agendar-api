import { getEstablishmentInfo } from "@/routes/public/get-establishment-info"
import { getEstablishmentPackages } from "@/routes/public/get-establishment-packages"
import { getEstablishmentProfessionals } from "@/routes/public/get-establishment-professionals"
import { getEstablishmentServices } from "@/routes/public/get-establishment-services"
import { getProfessionalServices } from "@/routes/public/get-professional-services"
import { getServiceProfessionals } from "@/routes/public/get-service-professionals"
import type { FastifyInstance } from "fastify"

export async function publicRoutes(app: FastifyInstance) {
  await getEstablishmentInfo(app)
  await getEstablishmentServices(app)
  await getEstablishmentProfessionals(app)
  await getEstablishmentPackages(app)
  await getServiceProfessionals(app)
  await getProfessionalServices(app)
}
