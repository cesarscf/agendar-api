import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { employeeSchema } from "@/utils/schemas/employees"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../erros/bad-request-error"

export async function getEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .get(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Get establishment employee by id",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            201: employeeSchema,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id: employeeId } = request.params

        const employee = await db.query.employees.findFirst({
          where: and(
            eq(employees.establishmentId, establishmentId),
            eq(employees.id, employeeId)
          ),
          columns: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            address: true,
            active: true,
            avatarUrl: true,
            phone: true,
            biography: true,
          },
        })

        if (!employee) {
          throw new BadRequestError("Employee not found")
        }

        return reply.status(201).send(employee)
      }
    )
}
