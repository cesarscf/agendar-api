import { db } from "@/db"
import { packageItems, packages } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { establishmentHeaderSchema } from "@/utils/schemas/headers"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

const packageItemSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.number().int().min(1),
})

const associatePackageItemsSchema = z.array(packageItemSchema)
const associatePackageItemsSchemaWithPackageId = z.object({
  items: associatePackageItemsSchema,
})

export async function associateItemsToPackage(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.post(
      "/packages/:packageId/items",
      {
        schema: {
          tags: ["Package"],
          summary: "Associate items to a package",
          security: [{ bearerAuth: [] }],
          headers: establishmentHeaderSchema,
          params: z.object({
            packageId: z.string().uuid(),
          }),
          body: associatePackageItemsSchemaWithPackageId,
          response: {
            204: z.null(),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { packageId } = request.params
        const { items } = request.body

        const { establishmentId } = await request.getCurrentEstablishmentId()

        const packageExists = await db.query.packages.findFirst({
          where: and(
            eq(packages.id, packageId),
            eq(packages.establishmentId, establishmentId)
          ),
        })

        if (!packageExists) {
          return reply.status(404).send({ message: "Package not found" })
        }

        await db
          .delete(packageItems)
          .where(eq(packageItems.packageId, packageId))

        await db.insert(packageItems).values(
          items.map(it => ({
            packageId,
            serviceId: it.serviceId,
            quantity: it.quantity,
          }))
        )

        return reply.status(204).send()
      }
    )
  })
}
