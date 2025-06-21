import { db } from "@/db"
import { quotes } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createQuote(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/quotes",
      {
        schema: {
          tags: ["Quotes"],
          summary: "Create a new quote",
          security: [{ bearerAuth: [] }],
          body: z.object({
            requestId: z.string(),
            price: z.string(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const currentUserId = await request.getCurrentUserId()

        const { price, requestId } = request.body

        await db.insert(quotes).values({
          authorId: currentUserId,
          requestId,
          price,
        })

        return reply.status(201).send()
      }
    )
}
