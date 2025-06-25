import { db } from "@/db"
import {
  appointments,
  employeeRecurringBlocks,
  employeeServices,
  employeeTimeBlocks,
  services,
} from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { addMinutes, isAfter, isBefore } from "date-fns"
import { and, eq, gt, lt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createAppointment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(customerAuth)
    .post(
      "/appointments",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Create a new appointment",
          body: z.object({
            employeeId: z.string().uuid(),
            serviceId: z.string().uuid(),
            startTime: z.coerce.date(),
          }),
          response: {
            201: z.object({ id: z.string().uuid() }),
            400: z.object({ message: z.string() }),
            409: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { employeeId, serviceId, startTime } = request.body
        const { customerId, establishmentId } =
          await request.getCurrentCustomerEstablishmentId()

        // 1. Verifica se o funcionário presta o serviço
        const relation = await db.query.employeeServices.findFirst({
          where: and(
            eq(employeeServices.employeeId, employeeId),
            eq(employeeServices.serviceId, serviceId)
          ),
        })

        if (!relation) {
          return reply
            .status(400)
            .send({ message: "Funcionário não presta este serviço" })
        }

        // 2. Pega a duração do serviço
        const service = await db.query.services.findFirst({
          where: eq(services.id, serviceId),
          columns: { durationInMinutes: true },
        })

        if (!service) {
          return reply.status(400).send({ message: "Serviço inválido" })
        }

        const duration = service.durationInMinutes
        const endTime = addMinutes(startTime, duration)
        const conflictingAppointment = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.employeeId, employeeId),
              eq(appointments.establishmentId, establishmentId),
              lt(appointments.startTime, endTime),
              gt(appointments.endTime, startTime)
            )
          )
          .limit(1)
          .then(res => res[0])

        if (conflictingAppointment) {
          return reply
            .status(409)
            .send({ message: "Já existe um agendamento neste horário" })
        }

        const conflictingBlock = await db
          .select()
          .from(employeeTimeBlocks)
          .where(
            and(
              eq(employeeTimeBlocks.employeeId, employeeId),
              lt(employeeTimeBlocks.startsAt, endTime),
              gt(employeeTimeBlocks.endsAt, startTime)
            )
          )
          .limit(1)
          .then(res => res[0])

        if (conflictingBlock) {
          return reply
            .status(409)
            .send({ message: "Horário bloqueado pelo funcionário" })
        }

        const weekday = startTime.getDay()
        const recurringBlocks = await db
          .select()
          .from(employeeRecurringBlocks)
          .where(
            and(
              eq(employeeRecurringBlocks.employeeId, employeeId),
              eq(employeeRecurringBlocks.weekday, weekday)
            )
          )

        const hasRecurringConflict = recurringBlocks.some(block => {
          const blockStart = new Date(
            `${startTime.toISOString().split("T")[0]}T${block.startTime}`
          )
          const blockEnd = new Date(
            `${startTime.toISOString().split("T")[0]}T${block.endTime}`
          )
          return isBefore(startTime, blockEnd) && isAfter(endTime, blockStart)
        })

        if (hasRecurringConflict) {
          return reply.status(409).send({
            message: "Horário bloqueado recorrentemente pelo funcionário",
          })
        }

        const [appointment] = await db
          .insert(appointments)
          .values({
            employeeId,
            serviceId,
            customerId,
            startTime,
            endTime,
            establishmentId,
          })
          .returning({ id: appointments.id })

        return reply.status(201).send({ id: appointment.id })
      }
    )
}
