import { addLoyaltyServices } from "@/routes/loyalty-programs/add-loyalty-services"
import { createLoyaltyProgram } from "@/routes/loyalty-programs/create-loyalty-program"
import { deleteLoyaltyProgram } from "@/routes/loyalty-programs/delete-loyalty-program"
import { getByIdLoyaltyProgram } from "@/routes/loyalty-programs/get-by-id-loyalty-program"
import { getLoyaltyProgram } from "@/routes/loyalty-programs/get-loyalty-program"
import { listLoyaltyProgramServices } from "@/routes/loyalty-programs/list-loyalty-program-services"
import { removeLoyaltyService } from "@/routes/loyalty-programs/remove-loyalty-service"
import { updateLoyaltyProgram } from "@/routes/loyalty-programs/update-loyalty-program"
import { updateLoyaltyService } from "@/routes/loyalty-programs/update-loyalty-service"
import type { FastifyInstance } from "fastify"

export async function loyaltyProgramsRoutes(app: FastifyInstance) {
  await createLoyaltyProgram(app)
  await getLoyaltyProgram(app)
  await updateLoyaltyProgram(app)
  await deleteLoyaltyProgram(app)
  await getByIdLoyaltyProgram(app)
  await addLoyaltyServices(app)
  await listLoyaltyProgramServices(app)
  await updateLoyaltyService(app)
  await removeLoyaltyService(app)
}
