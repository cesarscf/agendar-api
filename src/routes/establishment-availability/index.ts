import type { FastifyInstance } from "fastify"

import { createAvailability } from "./create-availability"
import { deleteAvailability } from "./delete-availability"
import { getAvailability } from "./get-availability"
import { updateAvailability } from "./update-availability"

export async function availabilityRoutes(app: FastifyInstance) {
  await createAvailability(app)
  await getAvailability(app)
  await updateAvailability(app)
  await deleteAvailability(app)
}
