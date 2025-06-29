import { db } from "@/db"
import { establishments, services } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
export async function getEstablishmentServices(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:slug/services",
    {
      schema: {
        tags: ["Public"],
        summary: "Listar serviços da loja",
        params: z.object({ slug: z.string() }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              price: z.string(),
              durationInMinutes: z.number(),
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

      const result = await db.query.services.findMany({
        where: and(
          eq(services.establishmentId, est.id),
          eq(services.active, true)
        ),
        columns: {
          id: true,
          name: true,
          description: true,
          price: true,
          durationInMinutes: true,
        },
      })

      return reply.send(result)
    }
  )
}
