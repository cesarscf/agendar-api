import { db } from "@/db"
import { employees, establishments } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEstablishmentProfessionals(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:slug/professionals",
    {
      schema: {
        tags: ["Public"],
        summary: "Listar profissionais da loja",
        params: z.object({ slug: z.string() }),
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
      const { slug } = req.params

      const est = await db.query.establishments.findFirst({
        where: eq(establishments.slug, slug),
        columns: { id: true },
      })

      if (!est) return reply.status(404).send()

      const result = await db.query.employees.findMany({
        where: eq(employees.establishmentId, est.id),
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
          biography: true,
        },
      })

      return reply.send(result)
    }
  )
}
