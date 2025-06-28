import { db } from "@/db"
import { employeeRecurringBlocks, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function deleteEmployeeRecurringBlock(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/recurring-blocks/:blockId",
      {
        schema: {
          tags: ["Employee Recurring Blocks"],
          summary: "Delete recurring employee time block",
          security: [{ bearerAuth: [] }],
          params: z.object({
            blockId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
            403: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { blockId } = request.params
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const block = await db
          .select({
            id: employeeRecurringBlocks.id,
            employeeId: employeeRecurringBlocks.employeeId,
          })
          .from(employeeRecurringBlocks)
          .where(eq(employeeRecurringBlocks.id, blockId))
          .then(res => res[0])

        if (!block) {
          return reply.status(404).send({ message: "Block not found" })
        }

        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, block.employeeId),
        })

        if (!employee || employee.establishmentId !== establishmentId) {
          return reply.status(403).send({ message: "Unauthorized" })
        }

        await db
          .delete(employeeRecurringBlocks)
          .where(eq(employeeRecurringBlocks.id, blockId))

        return reply.status(204).send()
      }
    )
}
