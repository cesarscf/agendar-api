import { db } from "@/db"
import { fcmTokens } from "@/db/schema"
import { env } from "@/env"
import { adminRoutes } from "@/routes/admin"
import { adminLogin } from "@/routes/admin/login"
import { appointmentsRoutes } from "@/routes/appointments"
import { categoriesRoutes } from "@/routes/categories"
import { customersRoutes } from "@/routes/customers"
import { dashboardRoutes } from "@/routes/dashboard"
import { employeeBlocksRoutes } from "@/routes/employee-blocks"
import { employeesRoutes } from "@/routes/employees"
import { availabilityRoutes } from "@/routes/establishment-availability"
import { establishmentsRoutes } from "@/routes/establishments"
import { loyaltyProgramsRoutes } from "@/routes/loyalty-programs"
import { packagesRoutes } from "@/routes/packages"
import { partnerRoutes } from "@/routes/partner"
import { paymentMethodRoutes } from "@/routes/payment-method"
import { planRoutes } from "@/routes/plans"
import { publicRoutes } from "@/routes/public"
import { servicesRoutes } from "@/routes/services"
import { subscriptionRoutes } from "@/routes/subscription"
import { stripeWebhook } from "@/routes/subscription/stripe-webhook"
import { errorHandler } from "@/utils/error-handler"
import { fastifyCors } from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import { fastifySwagger } from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"
import { eq } from "drizzle-orm"
import { fastify } from "fastify"
import fastifyRawBody from "fastify-raw-body"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"

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

app.setErrorHandler(errorHandler)

app.register(fastifyCors)
app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.1",
    info: {
      title: "Worqui",
      version: "1.0.0",
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
app.register(fastifyRawBody, {
  field: "rawBody",
  global: false,
  encoding: false,
  runFirst: true,
})
app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
})
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.get("/health", async () => {
  return { message: "OK" }
})
app.get("/", async () => {
  return { message: "Hello World" }
})

app.setErrorHandler(errorHandler)
app.register(stripeWebhook)
app.register(planRoutes)
app.register(customersRoutes)
app.register(appointmentsRoutes)
app.register(subscriptionRoutes)
app.register(partnerRoutes)

app.register(categoriesRoutes)
app.register(dashboardRoutes)
app.register(employeeBlocksRoutes)
app.register(availabilityRoutes)
app.register(establishmentsRoutes)
app.register(loyaltyProgramsRoutes)
app.register(packagesRoutes)
app.register(employeesRoutes)
app.register(paymentMethodRoutes)
app.register(adminLogin)
app.register(servicesRoutes)
app.register(publicRoutes, { prefix: "/public" })
app.register(adminRoutes, { prefix: "/admin" })
app.put("/fcm/register", async (request, reply) => {
  const { token, userId } = request.body as { token: string; userId: string }

  if (!token) return reply.status(400).send({ error: "Token ausente" })
  if (!userId) return reply.status(400).send({ error: "User ID ausente" })
  const existingToken = await db.query.fcmTokens.findFirst({
    where: eq(fcmTokens.userId, userId),
  })
  if (!existingToken) {
    await db.insert(fcmTokens).values({ userId, token })
  }
  if (existingToken && existingToken.token !== token) {
    await db
      .update(fcmTokens)
      .set({ token })
      .where(eq(fcmTokens.userId, userId))
  }
  return reply.status(204).send()
})
app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!")
})
