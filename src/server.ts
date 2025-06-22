import { env } from "@/env"

import { fastifyCors } from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import { fastifySwagger } from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"
import { fastify } from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"

import { createAppointmentUsingPackage } from "@/routes/appointments/use-package"
import { getPartner } from "./routes/auth/get-partner"
import { login } from "./routes/auth/login"
import { register } from "./routes/auth/register"
import { deleteCategory } from "./routes/categories/delete-category"
import { getCategories } from "./routes/categories/get-categories"
import { updateCategory } from "./routes/categories/update-category"
import { errorHandler } from "./utils/error-handler"

const app = fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
})
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Worqui",
      version: "0.1",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.setErrorHandler(errorHandler)

app.register(login)
app.register(register)
app.register(getPartner)

app.register(createAppointmentUsingPackage)

app.register(getCategories)
app.register(updateCategory)
app.register(deleteCategory)

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!")
})
