import { db } from "@/db"
import { establishments } from "@/db/schema"
import {
  BadRequestError,
} from "@/routes/_erros/bad-request-error"
import { UnauthorizedError } from "@/routes/_erros/unauthorized-error"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import { fastifyPlugin } from "fastify-plugin"
import {ForbiddenError} from "@/routes/_erros/forbidden-request-error";

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
      const partnerId = await request.getCurrentPartnerId()
      const establishmentId = request.headers["x-establishment-id"] as string

      if (!establishmentId) {
        throw new BadRequestError(
          "Missing or invalid x-establishment-id header"
        )
      }

      const establishment = await db.query.establishments.findFirst({
        where: and(
          eq(establishments.id, establishmentId),
          eq(establishments.ownerId, partnerId)
        ),
      })

      if (!establishment) {
        throw new ForbiddenError("You do not have access to this resource")
      }

      return { establishmentId: establishment.id, partnerId }
    }
  })
})
