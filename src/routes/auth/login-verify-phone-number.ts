import { db } from "@/db"
import { users, verifications } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"

import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function loginVerifyPhoneNumber(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login/phone-number/verify",
    {
      schema: {
        tags: ["Auth"],
        summary: "Verify phone number",
        description: "Use this endpoint to verify phone number",
        body: z.object({
          phone: z.string({ description: "Phone number to verify" }),
          code: z.string({ description: "OTP code" }),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { phone, code } = request.body

      const userFromPhone = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      })

      if (!userFromPhone) {
        throw new BadRequestError("User not found")
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

      const token = await reply.jwtSign(
        {
          sub: userFromPhone.id,
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
