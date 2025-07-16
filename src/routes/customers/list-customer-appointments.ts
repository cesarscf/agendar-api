import { db } from "@/db"
import { appointments, employees, services } from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { customerHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listCustomerAppointments(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(customerAuth)
    typedApp.get(
      "/me/appointments",
      {
        schema: {
          tags: ["Customer"],
          headers: customerHeaderSchema,
          summary: "Listar histórico de agendamentos",
          response: {
            200: z.array(
              z.object({
                id: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                status: z.string(),
                professional: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
                service: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const customerId = await request.getCurrentCustomerId()

        const history = await db
          .select({
            id: appointments.id,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            status: appointments.status,
            professional: {
              id: employees.id,
              name: employees.name,
            },
            service: {
              id: services.id,
              name: services.name,
            },
          })
          .from(appointments)
          .innerJoin(employees, eq(appointments.employeeId, employees.id))
          .innerJoin(services, eq(appointments.serviceId, services.id))
          .where(eq(appointments.customerId, customerId))

        return reply.send(history)
      }
    )
  })
}
