import { db } from "@/db"
import { employeeServices, employees } from "@/db/schema"
import { appointments } from "@/db/schema/appointments"
import { customerServicePackages } from "@/db/schema/customer-service-packages"
import { customerServicePackageUsages } from "@/db/schema/customer-service-packages-usages"
import { packageItems } from "@/db/schema/package-items"
import { customerAuth } from "@/middlewares/customer-auth"
import { addMinutes, splitDate } from "@/utils/get-date"
import { and, eq, gt, gte, isNull, lt, lte, or } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  clientId: z.string().uuid(),
  servicePackageId: z.string().uuid(),
  date: z.coerce.date(),
})

export async function createAppointmentUsingPackage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(customerAuth)
    .post(
      "/appointments/use-package",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Create appointment using service package",
          body: createAppointmentSchema,
          response: {
            204: z.null(),
            400: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { customerId, establishmentId } =
          await request.getCurrentCustomerEstablishmentId()
        const { employeeId, serviceId, date } = request.body
        const { day: startTime, hour } = splitDate(date)

        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        })
        if (!employee) {
          throw new Error("Funcionário não encontrado")
        }
        const employeeService = await db.query.employeeServices.findFirst({
          where: and(
            eq(employeeServices.employeeId, employeeId),
            eq(employeeServices.serviceId, serviceId)
          ),
          with: {
            service: true,
          },
        })
        if (!employeeService) {
          throw new Error("Serviço não encontrado para o funcionário")
        }
        const endTime = addMinutes(hour, employeeService.service.duration)
        const conflictingAppointments = await db.query.appointments.findMany({
          where: and(
            employeeId ? eq(appointments.employeeId, employeeId) : undefined,
            or(
              and(
                gte(appointments.startTime, startTime),
                lt(appointments.startTime, endTime)
              ),
              and(
                gt(appointments.endTime, startTime),
                lte(appointments.endTime, endTime)
              ),
              and(
                lte(appointments.startTime, startTime),
                gte(appointments.endTime, endTime)
              )
            )
          ),
        })

        if (conflictingAppointments.length > 0) {
          throw new Error(
            "Conflito de horário: já existe um agendamento neste período"
          )
        }

        request.log.info({
          msg: "Starting appointment creation using package",
          customerId,
          establishmentId,
          serviceId,
          startTime,
          endTime,
        })

        const validPackages = await db
          .select({
            packageId: customerServicePackages.id,
            remaining: customerServicePackages.remainingSessions,
            expiresAt: customerServicePackages.expiresAt,
          })
          .from(customerServicePackages)
          .innerJoin(
            packageItems,
            eq(packageItems.packageId, customerServicePackages.servicePackageId)
          )
          .where(
            and(
              eq(customerServicePackages.customerId, customerId),
              eq(customerServicePackages.paid, true),
              eq(packageItems.serviceId, serviceId),
              gt(customerServicePackages.remainingSessions, 0),
              or(
                isNull(customerServicePackages.expiresAt),
                gt(customerServicePackages.expiresAt, new Date())
              )
            )
          )
          .orderBy(customerServicePackages.purchasedAt)

        const selectedPackage = validPackages[0]

        if (!selectedPackage) {
          return reply
            .status(400)
            .send({ message: "No valid package available for this service." })
        }

        const [appointment] = await db
          .insert(appointments)
          .values({
            employeeId,
            establishmentId,
            customerId,
            serviceId,
            startTime,
            endTime,
          })
          .returning({ id: appointments.id })

        await db.insert(customerServicePackageUsages).values({
          customerServicePackageId: selectedPackage.packageId,
          serviceId,
          appointmentId: appointment.id,
          usedAt: new Date(),
        })

        return reply.status(204).send()
      }
    )
}
