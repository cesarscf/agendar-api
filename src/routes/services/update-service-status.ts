import { db } from "@/db"
import { packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../erros/bad-request-error"

export async function UpdateServiceStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/services/:id",
      {
        schema: {
          tags: ["Service"],
          summary: "Update service status",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            active: z.boolean(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: packageId } = request.params
        const data = request.body

        const packageExists = await db.query.packages.findFirst({
          where: and(
            eq(packages.establishmentId, establishmentId),
            eq(packages.id, packageId)
          ),
          columns: {
            id: true,
          },
        })

        if (!packageExists) {
          throw new BadRequestError("Package not found")
        }

        await db
          .update(packages)
          .set({
            active: data.active,
          })
          .where(
            and(
              eq(packages.id, packageId),
              eq(packages.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
}
