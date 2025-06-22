import { db } from "@/db"
import { establishments } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { UnauthorizedError } from "@/routes/_erros/unauthorized-error"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import { fastifyPlugin } from "fastify-plugin"

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async request => {
    request.getCurrentPartnerId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch {
        throw new UnauthorizedError("Invalid token")
      }
    }

    request.getCurrentEstablishmentId = async () => {
      try {
        const partnerId = (await request.getCurrentPartnerId()) as string
        const establishmentId = request.headers["establishment-id"] as string

        if (!establishmentId) {
          throw new BadRequestError("Establishment not found")
        }

        const establishment = await db.query.establishments.findFirst({
          where: and(
            eq(establishments.id, establishmentId),
            eq(establishments.ownerId, partnerId)
          ),
        })

        if (!establishment) {
          throw new BadRequestError("Establishment not found")
        }

        return { establishmentId: establishment.id, partnerId }
      } catch {
        throw new BadRequestError("Establishment not found")
      }
    }
  })
})
