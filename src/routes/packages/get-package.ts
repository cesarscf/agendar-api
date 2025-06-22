import { db } from "@/db"
import { packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { packageSchema } from "@/utils/schemas/packages"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function getPackage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
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
            201: packageSchema,
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
        })

        if (!result) {
          throw new BadRequestError("Package not found")
        }

        return reply.status(201).send(result)
      }
    )
}
