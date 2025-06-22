import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/middlewares/auth"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { BadRequestError } from "../_erros/bad-request-error"

export async function getEmployee(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/employees/:id",
      {
        schema: {
          tags: ["Employee"],
          summary: "Get establishment employee by id",
          security: [{ bearerAuth: [] }],
          headers: z.object({
            "x-establishment-id": z.string(),
          }),
          params: z.object({
            id: z.string().uuid(),
          }),
          response: {
            201: z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email().nullable(),
              createdAt: z.date(),
              address: z.string().nullable(),
              active: z.boolean(),
              image: z.string().nullable(),
              phone: z.string().nullable(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id: employeeId } = request.params

        const employee = await db.query.employees.findFirst({
          where: and(
            eq(employees.establishmentId, establishmentId),
            eq(employees.id, employeeId)
          ),
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

        if (!employee) {
          throw new BadRequestError("Employee not found")
        }

        return reply.status(201).send(employee)
      }
    )
}
