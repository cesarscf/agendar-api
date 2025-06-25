import { db } from "@/db"
import { employeeTimeBlocks } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq, gt, lt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createEmployeeBlock(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/employees/:id/blocks",
      {
        schema: {
          tags: ["Employee Blocks"],
          summary: "Create time block for employee",
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            startsAt: z.coerce.date(),
            endsAt: z.coerce.date(),
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
        const { startsAt, endsAt, reason } = request.body
        const { establishmentId } = await request.getCurrentEstablishmentId()

        if (startsAt >= endsAt) {
          return reply
            .status(400)
            .send({ message: "startsAt must be before endsAt" })
        }

        const employee = await db.query.employees.findFirst({
          where: eq(employeeTimeBlocks.employeeId, employeeId),
        })

        if (!employee || employee.establishmentId !== establishmentId) {
          return reply.status(403).send({ message: "Unauthorized" })
        }
        const conflictingBlock = await db
          .select()
          .from(employeeTimeBlocks)
          .where(
            and(
              eq(employeeTimeBlocks.employeeId, employeeId),
              lt(employeeTimeBlocks.startsAt, endsAt),
              gt(employeeTimeBlocks.endsAt, startsAt)
            )
          )
          .limit(1)
          .then(res => res[0])

        if (conflictingBlock) {
          return reply
            .status(409)
            .send({ message: "Time block overlaps with existing block" })
        }

        const [block] = await db
          .insert(employeeTimeBlocks)
          .values({
            employeeId,
            startsAt,
            endsAt,
            reason,
          })
          .returning({ id: employeeTimeBlocks.id })

        return reply.status(201).send({ id: block.id })
      }
    )
}
