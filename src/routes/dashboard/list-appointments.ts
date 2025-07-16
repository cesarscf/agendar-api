import { db } from "@/db"
import {
  appointmentStatusValues,
  appointments,
  customers,
  employees,
  services,
} from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq, gte, lte, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

const appointmentStatusSchema = z.enum(appointmentStatusValues)

export async function listAppointments(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/establishments/appointments",
      {
        schema: {
          tags: ["Dashboard"],
          summary: "Listar agendamentos com filtros e paginação",
          querystring: z.object({
            page: z.coerce.number().min(1).default(1),
            perPage: z.coerce.number().min(1).max(100).default(10),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            status: appointmentStatusSchema.optional(),
            employeeId: z.string().uuid().optional(),
            serviceId: z.string().uuid().optional(),
          }),
          response: {
            200: z.object({
              appointments: z.array(
                z.object({
                  id: z.string(),
                  startTime: z.string(),
                  endTime: z.string(),
                  status: z.string(),
                  service: z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                  professional: z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                  customer: z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                })
              ),
              total: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const {
          page,
          perPage,
          startDate,
          endDate,
          status,
          employeeId,
          serviceId,
        } = request.query

        const offset = (page - 1) * perPage

        const filters = [
          eq(appointments.establishmentId, establishmentId),
          startDate && gte(appointments.startTime, new Date(startDate)),
          endDate && lte(appointments.endTime, new Date(endDate)),
          status && eq(appointments.status, status),
          employeeId && eq(appointments.employeeId, employeeId),
          serviceId && eq(appointments.serviceId, serviceId),
        ].filter(Boolean) as Parameters<typeof and>[0][]

        const [data, [{ count }]] = await Promise.all([
          db
            .select({
              id: appointments.id,
              startTime: appointments.startTime,
              endTime: appointments.endTime,
              status: appointments.status,
              service: {
                id: services.id,
                name: services.name,
              },
              professional: {
                id: employees.id,
                name: employees.name,
              },
              customer: {
                id: customers.id,
                name: customers.name,
              },
            })
            .from(appointments)
            .innerJoin(services, eq(appointments.serviceId, services.id))
            .innerJoin(employees, eq(appointments.employeeId, employees.id))
            .innerJoin(customers, eq(appointments.customerId, customers.id))
            .where(and(...filters))
            .limit(perPage)
            .offset(offset),
          db
            .select({
              count: sql<number>`COUNT(*)`.mapWith(Number),
            })
            .from(appointments)
            .where(and(...filters)),
        ])

        return reply.send({
          appointments: data.map(app => ({
            ...app,
            startTime: app.startTime.toISOString(),
            endTime: app.endTime.toISOString(),
          })),
          total: Number(count),
        })
      }
    )
  })
}
