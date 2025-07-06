import { db } from "@/db"
import { employeeServices, employees, establishments } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getServiceProfessionals(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:slug/services/:serviceId/professionals",
    {
      schema: {
        tags: ["Public"],
        summary: "Listar profissionais que realizam o serviço",
        params: z.object({
          slug: z.string(),
          serviceId: z.string().uuid(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              avatarUrl: z.string().nullable(),
              biography: z.string().nullable(),
            })
          ),
        },
      },
    },
    async (req, reply) => {
      const { slug, serviceId } = req.params

      const est = await db.query.establishments.findFirst({
        where: eq(establishments.slug, slug),
        columns: { id: true },
      })

      if (!est) return reply.status(404).send()

      const result = await db
        .select({
          id: employees.id,
          name: employees.name,
          avatarUrl: employees.avatarUrl,
          biography: employees.biography,
        })
        .from(employeeServices)
        .innerJoin(employees, eq(employees.id, employeeServices.employeeId))
        .where(
          and(
            eq(employeeServices.serviceId, serviceId),
            eq(employees.establishmentId, est.id)
          )
        )

      return reply.send(result)
    }
  )
}
