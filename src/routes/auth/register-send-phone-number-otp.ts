import { db } from "@/db"
import { users, verifications } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { generateRandomString } from "@/utils/generate-random-string"
import { getDate } from "@/utils/get-date"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function registerSendPhoneNumberOTP(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/register/phone-number/send-otp",
    {
      schema: {
        tags: ["Auth"],
        summary: "Send OTP for registration",
        description: "Send OTP to verify phone number before registration",
        body: z.object({
          phone: z.string(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { phone } = request.body

      const userExists = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      })

      if (userExists) {
        throw new BadRequestError("Phone number already registered")
      }

      const codeOTP = generateRandomString(4, "0-9")

      await db.insert(verifications).values({
        value: codeOTP,
        identifier: phone,
        expiresAt: getDate(60 * 5, "sec"), // 5 min
      })

      // TODO: Enviar OTP via SMS
      console.log(`Send registration OTP: ${codeOTP} to: ${phone}`)

      return reply.status(201).send()
    }
  )
}
