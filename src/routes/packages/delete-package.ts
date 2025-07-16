import { db } from "@/db"
import { customers, packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../erros/bad-request-error"

export async function deletePackage(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.delete(
      "/packages/:id",
      {
        schema: {
          tags: ["Package"],
          summary: "Delete package",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const { id: packageId } = request.params

        const packageExists = await db.query.customers.findFirst({
          where: and(
            eq(customers.establishmentId, establishmentId),
            eq(customers.id, packageId)
          ),
          columns: {
            id: true,
          },
        })

        if (!packageExists) {
          throw new BadRequestError("Package not found")
        }

        await db
          .delete(packages)
          .where(
            and(
              eq(packages.id, packageId),
              eq(packages.establishmentId, establishmentId)
            )
          )

        return reply.status(204).send()
      }
    )
  })
}
