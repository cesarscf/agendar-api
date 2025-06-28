import { db } from "@/db"
import { partners } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getPartner(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/partner",
      {
        schema: {
          tags: ["Auth"],
          summary:
            "Get authenticated partner data with establishments and subscriptions",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              partner: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                establishments: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                  })
                ),
                subscriptions: z.array(
                  z.object({
                    id: z.string(),
                    status: z.string(),
                    endedAt: z.date().nullable(),
                    createdAt: z.date(),
                  })
                ),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const partnerId = await request.getCurrentPartnerId()

        const partner = await db.query.partners.findFirst({
          where: eq(partners.id, partnerId),
          columns: {
            id: true,
            name: true,
            email: true,
          },
          with: {
            establishments: {
              columns: {
                id: true,
                name: true,
              },
            },
            subscriptions: {
              columns: {
                id: true,
                status: true,
                endedAt: true,
                createdAt: true,
              },
            },
          },
        })

        if (!partner) {
          throw new BadRequestError("User not found")
        }

        return reply.status(200).send({ partner })
      }
    )
}
