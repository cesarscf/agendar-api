import { db } from "@/db"
import { quotes } from "@/db/schema"

import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getQuotes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/quotes",
      {
        schema: {
          tags: ["Quotes"],
          summary: "Get all user quotes",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              itens: z.array(
                z.object({
                  id: z.string().uuid(),
                  price: z.string(),
                  status: z.enum(["pending", "accepted", "rejected"]),
                  createdAt: z.date(),
                  updatedAt: z.date().nullable(),
                  request: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string().nullable(),
                    cep: z.string(),
                    authorId: z.string(),
                    status: z.enum(["open", "closed", "canceled"]),
                    createdAt: z.date(),
                    updatedAt: z.date().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async request => {
        const currentUserId = await request.getCurrentUserId()

        const data = await db.query.quotes.findMany({
          where: eq(quotes.authorId, currentUserId),
          with: {
            request: true,
          },
          columns: {
            id: true,
            price: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return { itens: data }
      }
    )
}
