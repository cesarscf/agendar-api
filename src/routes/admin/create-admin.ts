import { db } from "@/db"
import { admins } from "@/db/schema"
import bcrypt from "bcrypt"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createAdmin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register",
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const hashedPassword = await bcrypt.hash(password, 1)

      await db
        .insert(admins)
        .values({
          password: hashedPassword,
          email,
        })
        .returning()

      return reply.status(204).send()
    }
  )
}
