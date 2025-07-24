import { db } from "@/db"
import { services } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function updateService(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.put(
      "/services/:id",
      {
        schema: {
          tags: ["Service"],
          summary: "Update service",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().optional(),
            price: z.string().optional(),
            active: z.boolean().optional(),
            durationInMinutes: z.number().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: serviceId } = request.params
        const data = request.body

        const serviceExists = await db.query.services.findFirst({
          where: and(
            eq(services.establishmentId, establishmentId),
            eq(services.id, serviceId)
          ),
          columns: {
            id: true,
          },
        })

        if (!serviceExists) {
          throw new BadRequestError("Service not found")
        }

        await db
          .update(services)
          .set({
            ...data,
          })
          .where(
            and(
              eq(services.id, serviceId),
              eq(services.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
  })
}
