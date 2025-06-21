import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { BadRequestError } from "@/routes/_erros/bad-request-error"

import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/profile",
      {
        schema: {
          tags: ["Auth"],
          summary: "Get authenticated user profile",
          security: [{ bearerAuth: [] }],
          response: {
            201: z.object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                phone: z.string(),
                cep: z.string().nullish(),
                email: z.string().nullish(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: {
            id: true,
            name: true,
            phone: true,
            cep: true,
            email: true,
          },
        })

        if (!user) {
          throw new BadRequestError("User not found")
        }

        return reply.status(201).send({ user })
      }
    )
}
