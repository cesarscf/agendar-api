import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { customerSchema } from "@/utils/schemas/customers"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getCustomer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/customers/:id",
      {
        schema: {
          tags: ["Customer"],
          summary: "Get establishment customer by id",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            201: customerSchema,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.customers.findFirst({
          where: eq(customers.establishmentId, establishmentId),
          columns: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
            birthDate: true,
            address: true,
            cpf: true,
            notes: true,
          },
        })

        return reply.status(201).send(result)
      }
    )
}
