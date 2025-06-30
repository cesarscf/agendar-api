import { checkCustomerActivePackage } from "@/routes/customers/check-customer-active-package"
import { createCustomer } from "@/routes/customers/create-customer"
import { deleteCustomer } from "@/routes/customers/delete-customer"
import { getCustomer } from "@/routes/customers/get-customer"
import { getCustomers } from "@/routes/customers/get-customers"
import { getAvailability } from "@/routes/customers/get-establishment-availability"
import { listCustomerPackages } from "@/routes/customers/list-customer-packages"
import { updateCustomer } from "@/routes/customers/update-customer"
import { verifyCustomerByPhone } from "@/routes/customers/verify-customer-by-phone"
import type { FastifyInstance } from "fastify"

export async function customersRoutes(app: FastifyInstance) {
  await getCustomer(app)
  await getCustomers(app)
  await deleteCustomer(app)
  await createCustomer(app)
  await updateCustomer(app)
  await getAvailability(app)
  await listCustomerPackages(app)
  await verifyCustomerByPhone(app)
  await checkCustomerActivePackage(app)
}
