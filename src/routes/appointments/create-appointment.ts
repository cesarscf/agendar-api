import { messaging } from "@/clients/firebase"
import { db } from "@/db"
import {
  appointments,
  customers,
  employeeRecurringBlocks,
  employeeServices,
  employeeTimeBlocks,
  establishments,
  fcmTokens,
  services,
} from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { customerHeaderSchema } from "@/utils/schemas/headers"
import { addMinutes, format, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { and, eq, gt, lt } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createAppointment(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(customerAuth)
    typedApp.post(
      "/appointments",
      {
        schema: {
          tags: ["Appointments"],
          headers: customerHeaderSchema,
          summary: "Create a new appointment",
          body: z.object({
            employeeId: z.string().uuid(),
            serviceId: z.string().uuid(),
            date: z.coerce.date(), // 👈 nova chave obrigatória no payload
            startTime: z.coerce.date(), // continua sendo o horário com data completa
          }),
          response: {
            201: z.object({ id: z.string().uuid() }),
            400: z.object({ message: z.string() }),
            409: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { employeeId, serviceId, date, startTime } = request.body
        const { customerId, establishmentId } =
          await request.getCurrentCustomerEstablishmentId()
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, customerId),
        })
        if (!customer) {
          return reply.status(404).send({ message: "Cliente não encontrado" })
        }
        const establishment = await db.query.establishments.findFirst({
          where: eq(establishments.id, establishmentId),
        })

        if (!establishment) {
          return reply
            .status(404)
            .send({ message: "Estabelecimento não encontrado" })
        }

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

        const service = await db.query.services.findFirst({
          where: eq(services.id, serviceId),
          columns: { durationInMinutes: true, name: true },
        })

        if (!service) {
          return reply.status(400).send({ message: "Serviço inválido" })
        }
        const formattedDate = format(date, "yyyy-MM-dd")

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
              gt(appointments.endTime, startTime),
              eq(appointments.date, formattedDate)
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
            date: formattedDate,
            establishmentId,
          })
          .returning({ id: appointments.id, date: appointments.date })

        const tokenRecord = await db.query.fcmTokens.findFirst({
          where: eq(fcmTokens.userId, establishmentId),
        })

        if (tokenRecord) {
          const appointmentDateFormatted = format(
            appointment.date,
            "dd/MM 'às' HH:mm",
            { locale: ptBR }
          )
          try {
            await messaging.send({
              token: tokenRecord.token,
              notification: {
                title: `Novo agendamento em ${establishment.name}`,
                body: `${customer.name} agendou ${service.name} para ${appointmentDateFormatted}.`,
              },
              data: {
                establishmentId,
                type: "new_appointment",
                customerName: customer.name,
                service: service.name,
                date: appointment.date,
              },
            })
          } catch (err) {
            request.log.error(err, "Erro ao enviar notificação FCM")
            console.error(err, "Erro ao enviar notificação FCM")
          }
        }

        return reply.status(201).send({ id: appointment.id })
      }
    )
  })
}
