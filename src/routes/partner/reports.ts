import { db } from "@/db"
import { appointmentStatusEnum, appointments } from "@/db/schema/appointments"
import { customerLoyaltyPoints } from "@/db/schema/customer-loyalty-points"
import { customerServicePackages } from "@/db/schema/customer-service-packages"
import { customerServicePackageUsages } from "@/db/schema/customer-service-packages-usages"
import { customers } from "@/db/schema/customers"
import { loyaltyPrograms } from "@/db/schema/loyalty-programs"
import { packages } from "@/db/schema/packages"
import { auth } from "@/middlewares/auth"
import { BadRequestError } from "@/routes/erros/bad-request-error"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { endOfDay, startOfDay } from "date-fns"
import { and, avg, between, count, eq, sum } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function partnerReports(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/reports",
      {
        schema: {
          tags: ["Partner"],
          summary: "Get partner dashboard data",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          querystring: z.object({
            type: z.enum([
              "totalRevenue",
              "averageTicket",
              "serviceRevenue",
              "packageRevenue",
              "packageRevenueByEmployee",
              "serviceRevenueByEmployee",
              "serviceCount",
              "serviceCountByEmployee",
              "loyalty",
              "newCustomers",
            ]),
            startDate: z.string().datetime(),
            endDate: z.string().datetime(),
            serviceId: z.string().uuid().optional(),
            employeeId: z.string().uuid().optional(),
          }),
          response: {
            200: z.object({
              data: z.any(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { type, startDate, endDate, serviceId, employeeId } =
          request.query
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const start = startOfDay(new Date(startDate))
        const end = endOfDay(new Date(endDate))

        const where = and(
          eq(appointments.establishmentId, establishmentId),
          eq(appointments.status, appointmentStatusEnum.enumValues[2]),
          between(appointments.startTime, start, end)
        )

        switch (type) {
          case "totalRevenue": {
            const [result] = await db
              .select({ total: sum(appointments.paymentAmount) })
              .from(appointments)
              .where(where)
            return reply.status(200).send({ data: result.total ?? 0 })
          }

          case "averageTicket": {
            const [result] = await db
              .select({ average: avg(appointments.paymentAmount) })
              .from(appointments)
              .where(where)

            return reply.status(200).send({ data: result.average ?? 0 })
          }

          case "newCustomers": {
            const [result] = await db
              .select({ total: count() })
              .from(customers)
              .where(
                and(
                  eq(customers.establishmentId, establishmentId),
                  between(customers.createdAt, start, end)
                )
              )
            return reply.status(200).send({ data: result.total })
          }

          case "loyalty": {
            const [program] = await db
              .select({ id: loyaltyPrograms.id })
              .from(loyaltyPrograms)
              .where(eq(loyaltyPrograms.establishmentId, establishmentId))

            if (!program) return reply.status(200).send({ data: 0 })

            const [result] = await db
              .select({ total: sum(customerLoyaltyPoints.points) })
              .from(customerLoyaltyPoints)
              .where(eq(customerLoyaltyPoints.loyaltyProgramId, program.id))
            return reply.status(200).send({ data: result.total ?? 0 })
          }

          case "serviceRevenue": {
            if (!serviceId) {
              throw new BadRequestError("Missing serviceId")
            }
            const [result] = await db
              .select({ total: sum(appointments.paymentAmount) })
              .from(appointments)
              .where(and(where, eq(appointments.serviceId, serviceId)))
            return reply.status(200).send({ data: result.total ?? 0 })
          }

          case "serviceRevenueByEmployee": {
            if (!employeeId || !serviceId) {
              throw new BadRequestError("Missing params")
            }
            const [result] = await db
              .select({ total: sum(appointments.paymentAmount) })
              .from(appointments)
              .where(
                and(
                  where,
                  eq(appointments.serviceId, serviceId),
                  eq(appointments.employeeId, employeeId)
                )
              )
            return reply.status(200).send({ data: result.total ?? 0 })
          }

          case "serviceCount": {
            if (!serviceId) {
              throw new BadRequestError("Missing serviceId")
            }
            const [result] = await db
              .select({ total: count() })
              .from(appointments)
              .where(and(where, eq(appointments.serviceId, serviceId)))
            return reply.status(200).send({ data: result.total })
          }

          case "serviceCountByEmployee": {
            if (!employeeId || !serviceId) {
              throw new BadRequestError("Missing params")
            }
            const [result] = await db
              .select({ total: count() })
              .from(appointments)
              .where(
                and(
                  where,
                  eq(appointments.serviceId, serviceId),
                  eq(appointments.employeeId, employeeId)
                )
              )
            return reply.status(200).send({ data: result.total })
          }

          case "packageRevenue": {
            const [result] = await db
              .select({ total: sum(packages.price) })
              .from(customerServicePackages)
              .innerJoin(
                packages,
                eq(packages.id, customerServicePackages.servicePackageId)
              )
              .where(
                and(
                  eq(packages.establishmentId, establishmentId),
                  between(customerServicePackages.purchasedAt, start, end),
                  eq(customerServicePackages.paid, true)
                )
              )

            return reply.status(200).send({ data: result.total ?? 0 })
          }

          case "packageRevenueByEmployee": {
            if (!employeeId) {
              throw new BadRequestError("Missing employeeId")
            }
            const [result] = await db
              .select({ total: sum(packages.price) })
              .from(customerServicePackageUsages)
              .innerJoin(
                appointments,
                eq(appointments.id, customerServicePackageUsages.appointmentId)
              )
              .innerJoin(
                customerServicePackages,
                eq(
                  customerServicePackageUsages.customerServicePackageId,
                  customerServicePackages.id
                )
              )
              .innerJoin(
                packages,
                eq(customerServicePackages.servicePackageId, packages.id)
              )
              .where(
                and(
                  eq(appointments.employeeId, employeeId),
                  eq(appointments.establishmentId, establishmentId),
                  between(appointments.startTime, start, end),
                  eq(customerServicePackages.paid, true)
                )
              )
            return reply.status(200).send({ data: result.total ?? 0 })
          }

          default:
            throw new BadRequestError("Invalid report type")
        }
      }
    )
  })
}
