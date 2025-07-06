import { BadRequestError } from "@/routes/erros/bad-request-error"
import { UnauthorizedError } from "@/routes/erros/unauthorized-error"

import { ForbiddenError } from "@/routes/erros/forbidden-request-error"
import type { FastifyInstance } from "fastify"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error",
      errors: error.flatten().fieldErrors,
    })
  }
  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }
  if (error instanceof ForbiddenError) {
    reply.status(403).send({
      message: error.message,
    })
  }
  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    })
  }
  console.error(error)
  reply.status(500).send({ message: "Internal server error" })
}
