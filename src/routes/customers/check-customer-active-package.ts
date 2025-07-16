import { db } from "@/db"
import { customerServicePackages, packageItems, packages } from "@/db/schema"
import { customerAuth } from "@/middlewares/customer-auth"
import { customerHeaderSchema } from "@/utils/schemas/headers"
import { and, eq, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function checkCustomerActivePackage(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(customerAuth)
    typedApp.get(
      "/customers/has-active-package",
      {
        schema: {
          tags: ["Customer"],
          headers: customerHeaderSchema,
          summary: "Check if customer has an active package for a service",
          querystring: z.object({
            serviceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              hasActivePackage: z.boolean(),
            }),
          },
        },
      },
      async (request, reply) => {
        const customerId = await request.getCurrentCustomerId()
        const { serviceId } = request.query

        const result = await db
          .select({ id: customerServicePackages.id })
          .from(customerServicePackages)
          .innerJoin(
            packages,
            eq(packages.id, customerServicePackages.servicePackageId)
          )
          .innerJoin(packageItems, eq(packageItems.packageId, packages.id))
          .where(
            and(
              eq(customerServicePackages.customerId, customerId),
              eq(packageItems.serviceId, serviceId),
              sql`${customerServicePackages.remainingSessions} > 0`
            )
          )
          .limit(1)

        return reply.send({
          hasActivePackage: result.length > 0,
        })
      }
    )
  })
}
