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

export async function updateEmployee(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.put(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Update employee",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            biography: z.string().optional(),
            avatarUrl: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: employeeId } = request.params
        const inputs = request.body

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
            ...inputs,
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
  })
}
