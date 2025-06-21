import { db } from "@/db"
import { clients } from "@/db/schema"
import { requests } from "@/db/schema/requests"

import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createRequest(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/requests",
    {
      schema: {
        tags: ["Request"],
        summary: "Create a new service request",
        description:
          "This endpoint allows creating a new service request. If the client does not exist, they will be created automatically using the provided phone number.",
        body: z.object({
          phone: z.string(),
          name: z.string(),
          cep: z.string(),
          title: z.string(),
          description: z.string(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { phone, name, cep, description, title } = request.body

      let client = await db.query.clients.findFirst({
        where: eq(clients.phone, phone),
      })

      if (!client) {
        client = await db
          .insert(clients)
          .values({
            name,
            phone,
          })
          .then(res => res[0])
      }

      if (!client) {
        throw new Error("Client creation failed")
      }

      await db.insert(requests).values({
        authorId: client.id,
        cep,
        title,
        description,
      })

      return reply.status(201).send()
    }
  )
}
