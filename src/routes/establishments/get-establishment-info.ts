import { db } from "@/db"
import { establishments } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEstablishmentInfo(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/establishments",
      {
        schema: {
          tags: ["Establishment"],
          summary: "Exibir informações da loja",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          response: {
            200: z.object({
              id: z.string(),
              name: z.string(),
              theme: z.string(),
              about: z.string().nullable(),
              slug: z.string(),
              logoUrl: z.string().url().nullable(),
              bannerUrl: z.string().url().nullable(),
              phone: z.string().nullable(),
              servicesPerformed: z.string().nullable(),
              activeCustomers: z.string().nullable(),
              experienceTime: z.string().nullable(),
              googleMapsLink: z.string().nullable(),
              address: z.string().nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const establishment = await db.query.establishments.findFirst({
          where: eq(establishments.id, establishmentId),
          columns: {
            id: true,
            name: true,
            theme: true,
            about: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            phone: true,
            servicesPerformed: true,
            activeCustomers: true,
            experienceTime: true,
            googleMapsLink: true,
            address: true,
          },
        })

        if (!establishment) return reply.status(404).send()

        return reply.send(establishment)
      }
    )
}
