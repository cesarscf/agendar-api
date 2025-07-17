import { db } from "@/db"
import { plans } from "@/db/schema"
import { appointmentStatusEnum, appointments } from "@/db/schema/appointments"
import { customers } from "@/db/schema/customers"
import { partners } from "@/db/schema/partners"
import { subscriptions } from "@/db/schema/subscriptions"
import { BadRequestError } from "@/routes/erros/bad-request-error"
import { endOfDay, startOfDay } from "date-fns"
import { and, between, count, eq, gte, lte, sql, sum } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function adminReports(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/admin/reports",
    {
      schema: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          type: z.enum([
            "revenueByDate",
            "revenueByPlan",
            "revenueByState",
            "revenueByCity",
            "customerCountByDate",
            "customerCountByState",
            "customerCountByCity",
            "appVisits",
            "freeTrialCount",
            "appDownloads",
          ]),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { type, startDate, endDate } = request.query

      const start = startDate ? startOfDay(new Date(startDate)) : undefined
      const end = endDate ? endOfDay(new Date(endDate)) : undefined

      const dateRange =
        start && end ? between(appointments.startTime, start, end) : undefined

      switch (type) {
        case "revenueByDate": {
          const result = await db
            .select({
              date: sql`DATE(${appointments.startTime})`.as("date"),
              total: sum(appointments.paymentAmount).as("total"),
            })
            .from(appointments)
            .where(
              and(
                eq(appointments.status, appointmentStatusEnum.enumValues[2]),
                ...(dateRange ? [dateRange] : [])
              )
            )
            .groupBy(sql`DATE(${appointments.startTime})`)

          return reply.status(200).send({ revenueByDate: result })
        }

        case "revenueByPlan": {
          const result = await db
            .select({
              planId: subscriptions.planId,
              total: sql`COUNT(*) * CAST(plans.price AS NUMERIC)`.as("total"),
            })
            .from(subscriptions)
            .innerJoin(partners, eq(partners.id, subscriptions.partnerId))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .where(
              and(
                ...(start && end
                  ? [between(subscriptions.createdAt, start, end)]
                  : [])
              )
            )
            .groupBy(subscriptions.planId, plans.price)

          return reply.status(200).send({ revenueByPlan: result })
        }

        case "revenueByState": {
          const result = await db
            .select({
              state: partners.state,
              total: sql`COUNT(*) * CAST(plans.price AS NUMERIC)`.as("total"),
            })
            .from(subscriptions)
            .innerJoin(partners, eq(partners.id, subscriptions.partnerId))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .where(
              and(
                ...(start && end
                  ? [between(subscriptions.createdAt, start, end)]
                  : [])
              )
            )
            .groupBy(partners.state, plans.price)

          return reply.status(200).send({ revenueByState: result })
        }

        case "revenueByCity": {
          const result = await db
            .select({
              city: partners.city,
              total: sql`COUNT(*) * CAST(plans.price AS NUMERIC)`.as("total"),
            })
            .from(subscriptions)
            .innerJoin(partners, eq(partners.id, subscriptions.partnerId))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .where(
              and(
                ...(start && end
                  ? [between(subscriptions.createdAt, start, end)]
                  : [])
              )
            )
            .groupBy(partners.city, plans.price)

          return reply.status(200).send({ revenueByCity: result })
        }

        case "customerCountByDate": {
          const result = await db
            .select({
              date: sql`DATE(${customers.createdAt})`.as("date"),
              total: count().as("total"),
            })
            .from(customers)
            .where(
              and(
                ...(start && end
                  ? [between(customers.createdAt, start, end)]
                  : [])
              )
            )
            .groupBy(sql`DATE(${customers.createdAt})`)

          return reply.status(200).send({ customerCountByDate: result })
        }

        case "customerCountByState": {
          const result = await db
            .select({
              state: customers.state,
              total: count().as("total"),
            })
            .from(customers)
            .groupBy(customers.state)

          return reply.status(200).send({ customerCountByState: result })
        }

        case "customerCountByCity": {
          const result = await db
            .select({
              city: customers.city,
              total: count().as("total"),
            })
            .from(customers)
            .groupBy(customers.city)

          return reply.status(200).send({ customerCountByCity: result })
        }

        case "freeTrialCount": {
          if (!start || !end) {
            return reply
              .status(400)
              .send({ error: "Missing start or end date" })
          }
          const [result] = await db
            .select({ total: count() })
            .from(subscriptions)
            .where(
              and(
                eq(subscriptions.status, "trialing"),
                gte(subscriptions.createdAt, start),
                lte(subscriptions.createdAt, end)
              )
            )

          return { freeTrialCount: result.total }
        }

        case "appDownloads":
          return { downloads: { android: 0, ios: 0 } }

        case "appVisits":
          return { appVisits: 0 }
        default:
          throw new BadRequestError("Invalid report type")
      }
    }
  )
}
