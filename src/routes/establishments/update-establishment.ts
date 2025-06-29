import { db } from "@/db"
import { establishments } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function updateEstablishment(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/establishments",
      {
        schema: {
          tags: ["Establishment"],
          summary: "Atualizar dados do estabelecimento",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().optional(),
            phone: z.string().optional(),
            googleMapsLink: z.string().url().optional(),
            address: z.string().optional(),
            servicesPerformed: z.string().optional(),
            activeCustomers: z.string().optional(),
            experienceTime: z.string().optional(),
            logoUrl: z.string().url().optional(),
            bannerUrl: z.string().url().optional(),
            about: z.string().optional(),
            theme: z.enum(["blue", "green", "purple", "orange"]).optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const data = request.body

        await db
          .update(establishments)
          .set({ ...data })
          .where(eq(establishments.id, establishmentId))

        return reply.status(204).send()
      }
    )
}
