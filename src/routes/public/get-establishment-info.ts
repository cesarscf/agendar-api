import { db } from "@/db"
import { establishments } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEstablishmentInfo(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/:slug",
    {
      schema: {
        tags: ["Public"],
        summary: "Exibir informações públicas da loja",
        params: z.object({ slug: z.string() }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            logoUrl: z.string().url().nullable(),
            bannerUrl: z.string().url().nullable(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { slug } = req.params
      const establishment = await db.query.establishments.findFirst({
        where: eq(establishments.slug, slug),
        columns: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          bannerUrl: true,
        },
      })

      if (!establishment) return reply.status(404).send()

      return reply.send(establishment)
    }
  )
}
