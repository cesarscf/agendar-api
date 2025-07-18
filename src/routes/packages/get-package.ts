import { db } from "@/db"
import { packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { packageSchemaWithItems } from "@/utils/schemas/packages"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../erros/bad-request-error"

export async function getPackage(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.get(
      "/packages/:id",
      {
        schema: {
          tags: ["Package"],
          summary: "Get establishment package by id",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            200: packageSchemaWithItems,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.packages.findFirst({
          where: eq(packages.establishmentId, establishmentId),
          columns: {
            id: true,
            name: true,
            active: true,
            commission: true,
            description: true,
            image: true,
            price: true,
          },
          with: {
            packageItems: {
              columns: {
                quantity: true,
              },
              with: {
                service: {
                  columns: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        })

        if (!result) {
          throw new BadRequestError("Package not found")
        }

        const formatted = {
          ...result,
          items: result.packageItems?.map(item => ({
            serviceId: item.service.id,
            name: item.service.name,
            quantity: item.quantity,
          })),
        }

        return reply.status(200).send(formatted)
      }
    )
  })
}
