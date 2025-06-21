import { db } from "@/db"

import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getRequests(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/requests",
    {
      schema: {
        tags: ["Request"],
        summary: "Retrieve service requests",
        description:
          "Fetches all service requests including associated quotes and author details.",
        response: {
          200: z.object({
            itens: z.array(
              z.object({
                id: z.string().uuid(),
                title: z.string(),
                description: z.string().nullable(),
                cep: z.string(),
                status: z.enum(["open", "closed", "canceled"]),
                authorId: z.string(),
                createdAt: z.date(),
                updatedAt: z.date().nullable(),
                author: z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  phone: z.string(),
                }),
                quotes: z.array(
                  z.object({
                    id: z.string().uuid(),
                    price: z.string(),
                    status: z.enum(["pending", "accepted", "rejected"]),
                    createdAt: z.date(),
                    updatedAt: z.date().nullable(),
                  })
                ),
              })
            ),
          }),
        },
      },
    },
    async () => {
      const data = await db.query.requests.findMany({
        with: {
          quotes: {
            columns: {
              id: true,
              price: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          author: {
            columns: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      })

      return { itens: data }
    }
  )
}
