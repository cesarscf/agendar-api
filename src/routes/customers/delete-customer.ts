import { db } from "@/db"
import { categories, customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function deleteCustomer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/customers/:id",
      {
        schema: {
          tags: ["Customer"],
          summary: "Delete customer",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: customerId } = request.params

        const customer = await db.query.customers.findFirst({
          where: and(
            eq(customers.establishmentId, establishmentId),
            eq(customers.id, customerId)
          ),
          columns: {
            id: true,
          },
        })

        if (!customer) {
          throw new BadRequestError("Customer not found")
        }

        await db
          .delete(categories)
          .where(
            and(
              eq(categories.id, customerId),
              eq(categories.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
