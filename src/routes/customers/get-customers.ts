import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { customerSchema } from "@/utils/schemas/customers"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getCustomers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/customers",
      {
        schema: {
          tags: ["Customer"],
          summary: "Get establishment customers",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          response: {
            201: z.array(customerSchema),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.customers.findMany({
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
