import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function logout(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/logout",
    {
      schema: {
        tags: ["Partner"],
        summary: "Logout",
        response: {
          201: z.null(),
        },
      },
    },
    async (_, reply) => {
      reply.clearCookie("token")
      return reply.status(201).send()
    }
  )
}
