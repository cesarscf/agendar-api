import { createPackage } from "@/routes/packages/create-package"
import { deletePackage } from "@/routes/packages/delete-package"
import { getPackage } from "@/routes/packages/get-package"
import { getPackages } from "@/routes/packages/get-packages"
import { updatePackage } from "@/routes/packages/update-package"
import { UpdatePackageStatus } from "@/routes/packages/update-package-status"
import type { FastifyInstance } from "fastify"

export async function packagesRoutes(app: FastifyInstance) {
  await getPackages(app)
  await getPackage(app)
  await updatePackage(app)
  await deletePackage(app)
  await createPackage(app)
  await UpdatePackageStatus(app)
}
