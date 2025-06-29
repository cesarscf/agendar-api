import { db } from "@/db"
import {
  customerServicePackageUsages,
  customerServicePackages,
  packages,
} from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { eq, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function listCustomerPackages(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(customerAuth)
    .get(
      "/me/packages",
      {
        schema: {
          tags: ["Customer"],
          summary: "Listar pacotes adquiridos pelo cliente",
          response: {
            200: z.array(
              z.object({
                id: z.string(),
                name: z.string().nullable(),
                paid: z.boolean(),
                image: z.string().nullable(),
                description: z.string().nullable(),
                totalSessions: z.number(),
                remainingSessions: z.number(),
                usedSessions: z.number(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const customerId = await request.getCurrentCustomerId()

        const usedSessionsSubquery = db
          .select({
            customerServicePackageId:
              customerServicePackageUsages.customerServicePackageId,
            value: sql<number>`count(*)`.as("value"),
          })
          .from(customerServicePackageUsages)
          .groupBy(customerServicePackageUsages.customerServicePackageId)
          .as("usedSessions")

        const rows = await db
          .select({
            id: customerServicePackages.id,
            remainingSessions: customerServicePackages.remainingSessions,
            totalSessions: customerServicePackages.totalSessions,
            paid: customerServicePackages.paid,
            name: packages.name,
            description: packages.description,
            image: packages.image,
            usedSessions: usedSessionsSubquery.value,
          })
          .from(customerServicePackages)
          .leftJoin(
            packages,
            eq(packages.id, customerServicePackages.servicePackageId)
          )
          .leftJoin(
            usedSessionsSubquery,
            eq(
              usedSessionsSubquery.customerServicePackageId,
              customerServicePackages.id
            )
          )
          .where(eq(customerServicePackages.customerId, customerId))

        return reply.send(
          rows.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            image: pkg.image,
            paid: pkg.paid,
            totalSessions: pkg.totalSessions,
            remainingSessions: pkg.remainingSessions,
            usedSessions: Number(pkg.usedSessions ?? 0),
          }))
        )
      }
    )
}
