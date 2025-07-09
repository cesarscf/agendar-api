import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { employeeSchema } from "@/utils/schemas/employees"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .post(
      "/employees",
      {
        schema: {
          tags: ["Employee"],
          summary: "Create employee",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: employeeSchema.omit({ id: true }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        await db.insert(employees).values({
          ...data,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
}
