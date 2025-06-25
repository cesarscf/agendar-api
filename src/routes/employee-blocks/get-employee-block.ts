import { db } from "@/db"
import { employeeTimeBlocks, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq, gt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEmployeeBlocks(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/employees/:id/blocks",
      {
        schema: {
          tags: ["Employee Blocks"],
          summary: "Get future time blocks for employee",
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                startsAt: z.date(),
                endsAt: z.date(),
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

        const now = new Date()

        const blocks = await db
          .select()
          .from(employeeTimeBlocks)
          .where(
            and(
              eq(employeeTimeBlocks.employeeId, employeeId),
              gt(employeeTimeBlocks.endsAt, now)
            )
          )

        return reply.send(blocks)
      }
    )
}
