import { db } from "@/db"
import { customers } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function verifyCustomerByPhone(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/customers/verify",
    {
      schema: {
        tags: ["Customer"],
        summary: "Check if customer exists by phone",
        querystring: z.object({
          phone: z.string().min(8),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            name: z.string(),
            phoneNumber: z.string(),
          }),
          404: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { phone } = request.query

      const customer = await db.query.customers.findFirst({
        where: eq(customers.phoneNumber, phone),
        columns: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      })

      if (!customer) {
        return reply.status(404).send(null)
      }

      return reply.status(200).send(customer)
    }
  )
}
