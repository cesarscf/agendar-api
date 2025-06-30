import { db } from "@/db"
import { categories, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function UpdateEmployeeStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .patch(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Update employee status",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            active: z.boolean(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: employeeId } = request.params
        const { active } = request.body

        const employee = await db.query.employees.findFirst({
          where: and(
            eq(categories.establishmentId, establishmentId),
            eq(employees.id, employeeId)
          ),
          columns: {
            id: true,
            name: true,
          },
        })

        if (!employee) {
          throw new BadRequestError("Employee not found")
        }

        await db
          .update(employees)
          .set({
            active: active,
          })
          .where(
            and(
              eq(employees.id, employeeId),
              eq(employees.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
