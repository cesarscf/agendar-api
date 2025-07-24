import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { customerSchema } from "@/utils/schemas/customers"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function updateCustomer(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.put(
      "/customers/:id",
      {
        schema: {
          tags: ["Customer"],
          summary: "Update customer",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string(),
          }),
          body: customerSchema.omit({ id: true }),
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
              eq(customers.id, customerId),
              eq(customers.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
  })
}
