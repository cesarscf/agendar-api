import { db } from "@/db"
import { employeeRecurringBlocks, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq, gt, lt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createEmployeeRecurringBlock(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()

    typedApp.register(auth)

    typedApp.post(
      "/employees/:id/recurring-blocks",
      {
        schema: {
          tags: ["Employee Recurring Blocks"],
          summary: "Create recurring weekly time block for employee",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({ id: z.string().uuid() }),
          body: z.object({
            weekday: z.number().int().min(0).max(6),
            startTime: z.string(),
            endTime: z.string(),
            reason: z.string().optional(),
          }),
          response: {
            201: z.object({ id: z.string().uuid() }),
            409: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { id: employeeId } = request.params
        const { weekday, startTime, endTime, reason } = request.body
        const { establishmentId } = await request.getCurrentEstablishmentId()

        // Validação segura de horário
        const [startHour, startMinute] = startTime.split(":").map(Number)
        const [endHour, endMinute] = endTime.split(":").map(Number)
        const startDate = new Date(0, 0, 0, startHour, startMinute)
        const endDate = new Date(0, 0, 0, endHour, endMinute)

        if (startDate >= endDate) {
          return reply
            .status(400)
            .send({ message: "Horário inicial deve ser antes do final" })
        }

        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })

        if (!employee || employee.establishmentId !== establishmentId) {
          return reply.status(403).send({ message: "Unauthorized" })
        }

        const conflictingBlock = await db
          .select()
          .from(employeeRecurringBlocks)
          .where(
            and(
              eq(employeeRecurringBlocks.employeeId, employeeId),
              eq(employeeRecurringBlocks.weekday, weekday),
              lt(employeeRecurringBlocks.startTime, endTime),
              gt(employeeRecurringBlocks.endTime, startTime)
            )
          )
          .limit(1)
          .then(res => res[0])

        if (conflictingBlock) {
          return reply.status(409).send({
            message: "Horário conflitante com outro bloqueio recorrente.",
          })
        }

        const [block] = await db
          .insert(employeeRecurringBlocks)
          .values({
            employeeId,
            weekday,
            startTime: `${startTime}`,
            endTime: `${endTime}`,
            reason,
          })
          .returning({ id: employeeRecurringBlocks.id })

        return reply.status(201).send({ id: block.id })
      }
    )
  })
}
