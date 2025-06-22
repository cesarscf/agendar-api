import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import {} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createCustomer(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/customers",
      {
        schema: {
          tags: ["Customer"],
          summary: "Create customer",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          body: z.object({
            name: z.string(),
            phoneNumber: z.string(),
            birthDate: z.coerce.date(),
            email: z.string().email().nullable(),
            address: z.string().nullable(),
            cpf: z.string().nullable(),
            notes: z.string().nullable(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        await db.insert(customers).values({
          ...data,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
}
