import { db } from "@/db"
import { packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { packageSchema } from "@/utils/schemas/packages"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"

import { BadRequestError } from "../erros/bad-request-error"

export async function createPackage(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.post(
      "/packages",
      {
        schema: {
          tags: ["Package"],
          summary: "Create package",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: packageSchema.omit({ id: true }),
          response: {
            201: packageSchema,
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        const [createdPackage] = await db
          .insert(packages)
          .values({
            ...data,
            establishmentId,
          })
          .returning({
            id: packages.id,
            name: packages.name,
            active: packages.active,
            commission: packages.commission,
            description: packages.description,
            image: packages.image,
            price: packages.price,
          })

        if (!createdPackage) {
          throw new BadRequestError("Failed to create package")
        }

        return reply.status(201).send(createdPackage)
      }
    )
  })
}
