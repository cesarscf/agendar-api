import { db } from "@/db"
import { customers, establishments } from "@/db/schema"
import { BadRequestError } from "@/routes/erros/bad-request-error"
import { ForbiddenError } from "@/routes/erros/forbidden-request-error"
import { UnauthorizedError } from "@/routes/erros/unauthorized-error"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import { fastifyPlugin } from "fastify-plugin"

export const customerAuth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async request => {
    request.getCurrentCustomerId = async () => {
      const phone = request.headers["x-customer-phone"] as string
      if (!phone) {
        throw new UnauthorizedError("Customer Not Found")
      }
      const customer = await db.query.customers.findFirst({
        where: eq(customers.phoneNumber, phone),
      })
      if (!customer) {
        throw new UnauthorizedError("Customer Not Found")
      }
      return customer.id
    }

    request.getCurrentCustomerEstablishmentId = async () => {
      const customerId = await request.getCurrentCustomerId()
      if (!customerId) {
        throw new ForbiddenError("Customer Not Found")
      }
      const establishmentId = request.headers["x-establishment-id"] as string
      if (!establishmentId) {
        throw new BadRequestError(
          "Missing or invalid x-establishment-id header"
        )
      }

      const establishment = await db.query.customers.findFirst({
        where: and(
          eq(establishments.id, establishmentId),
          eq(customers.id, customerId)
        ),
      })

      if (!establishment) {
        throw new ForbiddenError("You do not have access to this resource")
      }

      return { establishmentId: establishment.id, customerId: customerId }
    }
  })
})
