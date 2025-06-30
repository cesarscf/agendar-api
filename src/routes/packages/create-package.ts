import { db } from "@/db"
import { packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { packageSchema } from "@/utils/schemas/packages"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createPackage(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/packages",
      {
        schema: {
          tags: ["Package"],
          summary: "Create package",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          body: packageSchema.omit({ id: true }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        await db.insert(packages).values({
          ...data,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
}
