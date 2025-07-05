import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../erros/bad-request-error"

export async function updateCustomer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/customers/:id",
      {
        schema: {
          tags: ["Customer"],
          summary: "Update customer",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            image: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: customerId } = request.params
        const data = request.body

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
          .update(customers)
          .set({
            ...data,
          })
          .where(
            and(
              eq(customers.id, customers),
              eq(customers.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
