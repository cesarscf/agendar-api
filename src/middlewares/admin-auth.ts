import { UnauthorizedError } from "@/routes/_erros/unauthorized-error"
import type { FastifyInstance } from "fastify"
import fastifyPlugin from "fastify-plugin"

export const adminAuth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async request => {
    let payload: { sub: string; role?: string }
    try {
      payload = await request.jwtVerify<{ sub: string; role?: string }>()
    } catch {
      throw new UnauthorizedError("Token inválido ou ausente")
    }
    if (payload.role !== "admin" && payload.role !== "superadmin") {
      throw new UnauthorizedError("Não autorizado")
    }
    request.getCurrentAdminId = () => payload.sub
    request.getCurrentAdminRole = () => payload.role || null
  })
})
