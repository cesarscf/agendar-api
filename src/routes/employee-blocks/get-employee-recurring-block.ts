import { db } from "@/db"
import { employeeRecurringBlocks, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEmployeeRecurringBlocks(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/employees/:id/recurring-blocks",
      {
        schema: {
          tags: ["Employee Recurring Blocks"],
          summary: "Get recurring weekly time blocks for employee",
          params: z.object({ id: z.string().uuid() }),
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                weekday: z.number(),
                startTime: z.string(),
                endTime: z.string(),
                reason: z.string().nullable(),
              })
            ),
            403: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { id: employeeId } = request.params
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })

        if (!employee || employee.establishmentId !== establishmentId) {
          return reply.status(403).send({ message: "Unauthorized" })
        }

        const blocks = await db
          .select()
          .from(employeeRecurringBlocks)
          .where(eq(employeeRecurringBlocks.employeeId, employeeId))

        return reply.send(blocks)
      }
    )
}
