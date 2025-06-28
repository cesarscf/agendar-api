import { deletePartnerPaymentMethod } from "@/routes/payment-method/delete-partner-payment-method"
import { listPartnerPaymentMethods } from "@/routes/payment-method/get-payment-methods"
import { getSetupIntent } from "@/routes/payment-method/get-setup-intent"
import type { FastifyInstance } from "fastify"

export async function paymentMethodRoutes(app: FastifyInstance) {
  await getSetupIntent(app)
  await listPartnerPaymentMethods(app)
  await deletePartnerPaymentMethod(app)
}
