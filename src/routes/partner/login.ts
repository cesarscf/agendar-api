import { db } from "@/db"
import { partners } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { UnauthorizedError } from "../_erros/unauthorized-error"

export async function login(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login",
    {
      schema: {
        tags: ["Partner"],
        summary: "Login",
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const existingPartner = await db.query.partners.findFirst({
        where: eq(partners.email, email.toLowerCase()),
        with: {
          establishments: true,
        },
      })

      if (!existingPartner) {
        throw new BadRequestError("Credências inválidas")
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingPartner.password
      )

      if (!isPasswordValid) {
        throw new UnauthorizedError("Credências inválidas")
      }

      const token = await reply.jwtSign(
        {
          sub: existingPartner.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      )

      return reply.status(201).send({ token })
    }
  )
}
