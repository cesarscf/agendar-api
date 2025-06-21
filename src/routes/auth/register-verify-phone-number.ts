import { db } from "@/db"
import { users, verifications } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function registerVerifyPhoneNumber(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/register/phone-number/verify",
    {
      schema: {
        tags: ["Auth"],
        summary: "Verify phone number and register",
        description: "Verify OTP and register new user",
        body: z.object({
          phone: z.string(),
          code: z.string(),
          name: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { phone, code, name } = request.body

      const existingUser = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      })

      if (existingUser) {
        throw new BadRequestError("Phone number already registered")
      }

      const otp = await db.query.verifications.findFirst({
        where: eq(verifications.identifier, phone),
      })

      if (!otp || otp.expiresAt < new Date()) {
        throw new BadRequestError("Invalid or expired OTP")
      }

      if (otp.value !== code) {
        throw new BadRequestError("Invalid OTP")
      }

      await db.delete(verifications).where(eq(verifications.id, otp.id))

      const [newUser] = await db
        .insert(users)
        .values({
          phone,
          name,
        })
        .returning({ id: users.id })

      const token = await reply.jwtSign(
        {
          sub: newUser.id,
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
