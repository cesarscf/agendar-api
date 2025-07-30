import { db } from "@/db"
import { admins } from "@/db/schema/admins"
import { UnauthorizedError } from "@/routes/_erros/unauthorized-error"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function adminLogin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/admin/login",
    {
      schema: {
        tags: ["Admin"],
        summary: "Administrator login",
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body
      const admin = await db.query.admins.findFirst({
        where: eq(admins.email, email),
      })
      if (!admin) throw new UnauthorizedError("Credências inválidas")
      const valid = await bcrypt.compare(password, admin.password)
      if (!valid) throw new UnauthorizedError("Credências inválidas")

      const token = await reply.jwtSign(
        { sub: admin.id, role: admin.role },
        {
          sign: { expiresIn: "7d" },
        }
      )

      reply.setCookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })

      return { token }
    }
  )
}
