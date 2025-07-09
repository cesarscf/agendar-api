import { db } from "@/db"
import { employeeServices, employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

const employeeServiceAssociationSchema = z.object({
  serviceId: z.string().uuid(),
  commission: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
})

const associateServicesSchema = z.array(employeeServiceAssociationSchema)

export async function associateServicesToEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .register(requireActiveSubscription)
    .post(
      "/employees/:employeeId/services",
      {
        schema: {
          tags: ["Employee"],
          summary: "Associate services to employee",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            employeeId: z.string().uuid(),
          }),
          body: associateServicesSchema,
          response: {
            204: z.null(),
            404: {
              message: z.string(),
            },
          },
        },
      },
      async (request, reply) => {
        const { employeeId } = request.params
        const services = request.body
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const employee = await db.query.employees.findFirst({
          where: and(
            eq(employees.id, employeeId),
            eq(employees.establishmentId, establishmentId)
          ),
        })

        if (!employee) {
          return reply.status(404).send({ message: "Employee not found" })
        }

        await db.insert(employeeServices).values(
          services.map(service => ({
            employeeId,
            serviceId: service.serviceId,
            commission: service.commission.toString(),
            isActive: service.isActive,
          }))
        )

        return reply.status(204).send()
      }
    )
}
