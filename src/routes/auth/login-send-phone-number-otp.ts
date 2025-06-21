import { db } from "@/db"
import { users, verifications } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { generateRandomString } from "@/utils/generate-random-string"
import { getDate } from "@/utils/get-date"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function loginSendPhoneNumberOTP(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login/phone-number/send-otp",
    {
      schema: {
        tags: ["Auth"],
        summary: "Send OTP to phone number",
        description: "Use this endpoint to send OTP to phone number",
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

      const userFromPhone = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      })

      if (!userFromPhone) {
        throw new BadRequestError("User not found")
      }

      const codeOTP = generateRandomString(4, "0-9")

      await db.insert(verifications).values({
        value: codeOTP,
        identifier: phone,
        expiresAt: getDate(60 * 5, "sec"), // 5 min
      })

      // TODO: Send code
      console.log(`Send code: ${codeOTP} to: ${phone}`)

      return reply.status(201).send()
    }
  )
}
