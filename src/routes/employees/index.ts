import { associateServicesToEmployee } from "@/routes/employees/associate-services-to-employee"
import { createEmployee } from "@/routes/employees/create-employee"
import { deleteEmployee } from "@/routes/employees/delete-employee"
import { getEmployee } from "@/routes/employees/get-employee"
import { getEmployees } from "@/routes/employees/get-employees"
import { updateEmployee } from "@/routes/employees/update-employee"
import { UpdateEmployeeStatus } from "@/routes/employees/update-employee-status"
import type { FastifyInstance } from "fastify"

export async function employeesRoutes(app: FastifyInstance) {
  await getEmployees(app)
  await getEmployee(app)
  await updateEmployee(app)
  await deleteEmployee(app)
  await createEmployee(app)
  await UpdateEmployeeStatus(app)
  await associateServicesToEmployee(app)
}
