import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { employeeSchema } from "@/utils/schemas/employees"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEmployees(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.get(
      "/employees",
      {
        schema: {
          tags: ["Employee"],
          summary: "Get establishment employees",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          response: {
            201: z.array(employeeSchema),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.employees.findMany({
          where: eq(employees.establishmentId, establishmentId),
          columns: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            address: true,
            active: true,
            avatarUrl: true,
            biography: true,
            phone: true,
          },
        })

        return reply.status(201).send(result)
      }
    )
  })
}
