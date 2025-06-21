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

import { getProfile } from "./routes/auth/get-profile"
import { loginSendPhoneNumberOTP } from "./routes/auth/login-send-phone-number-otp"
import { loginVerifyPhoneNumber } from "./routes/auth/login-verify-phone-number"
import { registerSendPhoneNumberOTP } from "./routes/auth/register-send-phone-number-otp"
import { registerVerifyPhoneNumber } from "./routes/auth/register-verify-phone-number"
import { createQuote } from "./routes/quotes/create-quote"
import { getQuotes } from "./routes/quotes/get-quotes"
import { createRequest } from "./routes/requests/create-request"
import { getRequest } from "./routes/requests/get-request"
import { getRequests } from "./routes/requests/get-requests"
import { errorHandler } from "./utils/error-handler"

const app = fastify()

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

app.register(loginSendPhoneNumberOTP)
app.register(loginVerifyPhoneNumber)
app.register(registerSendPhoneNumberOTP)
app.register(registerVerifyPhoneNumber)
app.register(getProfile)

app.register(createRequest)
app.register(getRequests)
app.register(getRequest)

app.register(getQuotes)
app.register(createQuote)

app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP server running!")
})
