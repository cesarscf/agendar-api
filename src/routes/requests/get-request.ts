import { db } from "@/db"
import { requests } from "@/db/schema/requests"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { eq } from "drizzle-orm"

import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getRequest(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/requests/:id",
    {
      schema: {
        tags: ["Request"],
        summary: "Retrieve a service request by ID",
        description:
          "This endpoint retrieves a service request by its unique ID.",
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            request: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              cep: z.string(),
              status: z.enum(["open", "closed", "canceled"]),
              authorId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date().nullable(),
            }),
          }),
        },
      },
    },
    async request => {
      const { id } = request.params

      const data = await db.query.requests.findFirst({
        where: eq(requests.id, id),
      })

      if (!data) {
        throw new BadRequestError("Request not found")
      }

      return { request: data }
    }
  )
}
