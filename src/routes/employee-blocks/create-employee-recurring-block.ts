import { db } from "@/db"
import { employeeRecurringBlocks } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq, gt, lt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createEmployeeRecurringBlock(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
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
            startTime: z
              .string()
              .regex(/^\d{2}:\d{2}:\d{2}$/, "Expected format HH:mm:ss"),
            endTime: z
              .string()
              .regex(/^\d{2}:\d{2}:\d{2}$/, "Expected format HH:mm:ss"),
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

        if (startTime >= endTime) {
          return reply
            .status(400)
            .send({ message: "startTime must be before endTime" })
        }
        const employee = await db.query.employees.findFirst({
          where: eq(employeeRecurringBlocks.employeeId, employeeId),
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
            message: "Recurring time block overlaps with existing block",
          })
        }

        const [block] = await db
          .insert(employeeRecurringBlocks)
          .values({
            employeeId,
            weekday,
            startTime,
            endTime,
            reason,
          })
          .returning({ id: employeeRecurringBlocks.id })

        return reply.status(201).send({ id: block.id })
      }
    )
}
