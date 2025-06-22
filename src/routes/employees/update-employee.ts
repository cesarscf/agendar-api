import { db } from "@/db"
import { categories, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function updateEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Update employee",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            image: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: employeeId } = request.params
        const { name } = request.body

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
            name,
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
