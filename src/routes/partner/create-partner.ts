import { stripe } from "@/clients/stripe"
import { db } from "@/db"
import { establishments, partners } from "@/db/schema"
import { BadRequestError } from "@/routes/_erros/bad-request-error"
import { generateRandomString } from "@/utils/generate-random-string"
import { slugify } from "@/utils/slug"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function createPartner(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register",
        body: z.object({
          name: z.string(),
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
      const { email, password, name } = request.body

      const existingPartner = await db.query.partners.findFirst({
        where: eq(partners.email, email),
      })

      if (existingPartner) {
        throw new BadRequestError("Usuário não encontrado")
      }

      const customerPayment = await stripe.customers.create({
        email: email,
        name: name,
      })

      const hashedPassword = await bcrypt.hash(password, 1)

      const [newPartner] = await db
        .insert(partners)
        .values({
          integrationPaymentId: customerPayment.id,
          name,
          password: hashedPassword,
          email,
        })
        .returning()

      const randomString = generateRandomString(4)

      await db
        .insert(establishments)
        .values({
          name: `My First Establishment-${randomString}`,
          slug: `${slugify(newPartner.name)}-${randomString}`,
          ownerId: newPartner.id,
        })
        .returning()

      const token = await reply.jwtSign(
        {
          sub: newPartner.id,
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
