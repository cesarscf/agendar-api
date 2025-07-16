import { messaging } from "@/clients/firebase"
import { db } from "@/db"
import { fcmTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"

export async function sendTestPushRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/admin/notifications/test",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ["Admin"],
        body: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: z.object({ success: z.boolean() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.body

      const tokenRecord = await db.query.fcmTokens.findFirst({
        where: eq(fcmTokens.userId, userId),
      })

      if (!tokenRecord) {
        return reply
          .status(404)
          .send({ error: "Token FCM não encontrado para o usuário." })
      }

      try {
        await messaging.send({
          token: tokenRecord.token,
          notification: {
            title: "Push de Teste",
            body: "Essa é uma notificação de teste.",
          },
          data: {
            userId,
            test: "true",
          },
        })

        return reply.status(200).send({ success: true })
      } catch (err) {
        request.log.error(err, "Erro ao enviar notificação FCM")
        return reply.status(500).send({ error: "Falha ao enviar push" })
      }
    }
  )
}
