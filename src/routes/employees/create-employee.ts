import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import {} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/employees",
      {
        schema: {
          tags: ["Employee"],
          summary: "Create employee",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          body: z.object({
            name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            image: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const data = request.body

        await db.insert(employees).values({
          ...data,
          establishmentId,
        })

        return reply.status(204).send()
      }
    )
}
