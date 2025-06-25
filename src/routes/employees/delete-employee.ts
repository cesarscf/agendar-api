import { db } from "@/db"
import { categories, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function deleteEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Delete employee",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
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
          },
        })

        if (!employee) {
          throw new BadRequestError("Employee not found")
        }

        await db
          .delete(categories)
          .where(
            and(
              eq(employees.id, employeeId),
              eq(categories.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
