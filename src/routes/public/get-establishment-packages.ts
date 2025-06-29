import { db } from "@/db"
import { establishments, packageItems, packages } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEstablishmentPackages(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:slug/packages",
    {
      schema: {
        tags: ["Public"],
        summary: "Listar pacotes de serviços da loja",
        params: z.object({ slug: z.string() }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              price: z.string(),
              totalServices: z.number(),
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

      const result = await db
        .select({
          id: packages.id,
          name: packages.name,
          description: packages.description,
          price: packages.price,
          image: packages.image,
          totalServices: sql<number>`COUNT(${packageItems.id})`.mapWith(Number),
        })
        .from(packages)
        .leftJoin(packageItems, eq(packageItems.packageId, packages.id))
        .where(eq(packages.establishmentId, est.id))
        .groupBy(packages.id)

      return reply.send(result)
    }
  )
}
