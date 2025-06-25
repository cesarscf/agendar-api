import { createCustomer } from "@/routes/customers/create-customer"
import { deleteCustomer } from "@/routes/customers/delete-customer"
import { getCustomer } from "@/routes/customers/get-customer"
import { getCustomers } from "@/routes/customers/get-customers"
import { getAvailability } from "@/routes/customers/get-establishment-availability"
import { updateCustomer } from "@/routes/customers/update-customer"
import type { FastifyInstance } from "fastify"

export async function customersRoutes(app: FastifyInstance) {
  await getCustomer(app)
  await getCustomers(app)
  await deleteCustomer(app)
  await createCustomer(app)
  await updateCustomer(app)
  await getAvailability(app)
}
