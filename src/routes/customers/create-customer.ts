import { db } from "@/db"
import { customers } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { customerSchema } from "@/utils/schemas/customers"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import {} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createCustomer(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.post(
      "/customers",
      {
        schema: {
          tags: ["Customer"],
          summary: "Create customer",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: customerSchema.omit({ id: true }),
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
  })
}
