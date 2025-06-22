import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getEmployees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/employees",
      {
        schema: {
          tags: ["Employee"],
          summary: "Get establishment employees",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            201: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email().nullable(),
                createdAt: z.date(),
                address: z.string().nullable(),
                active: z.boolean(),
                image: z.string().nullable(),
                phone: z.string().nullable(),
              })
            ),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()

        const result = await db.query.employees.findMany({
          where: eq(employees.establishmentId, establishmentId),
          columns: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            address: true,
            active: true,
            image: true,
            phone: true,
          },
        })

        return reply.status(201).send(result)
      }
    )
}
