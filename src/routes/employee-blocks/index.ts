import type { FastifyInstance } from "fastify"

import { createEmployeeRecurringBlock } from "@/routes/employee-blocks/create-employee-recurring-block"
import { deleteEmployeeRecurringBlock } from "@/routes/employee-blocks/delete-employee-recurring-block"
import { getEmployeeRecurringBlocks } from "@/routes/employee-blocks/get-employee-recurring-block"
import { createEmployeeBlock } from "./create-employee-block"
import { deleteEmployeeBlock } from "./delete-employee-block"
import { getEmployeeBlocks } from "./get-employee-block"

export async function employeeBlocksRoutes(app: FastifyInstance) {
  await createEmployeeBlock(app)
  await getEmployeeBlocks(app)
  await deleteEmployeeBlock(app)
  await createEmployeeRecurringBlock(app)
  await getEmployeeRecurringBlocks(app)
  await deleteEmployeeRecurringBlock(app)
}
