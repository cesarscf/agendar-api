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

import { adminRoutes } from "@/routes/admin"
import { adminLogin } from "@/routes/admin/login"
import { appointments } from "@/routes/appointments"
import { customersRoutes } from "@/routes/customers"
import { dashboardRoutes } from "@/routes/dashboard"
import { employeeBlocksRoutes } from "@/routes/employee-blocks"
import { employeesRoutes } from "@/routes/employees"
import { availabilityRoutes } from "@/routes/establishment-availability"
import { establishmentsRoutes } from "@/routes/establishments"
import { packagesRoutes } from "@/routes/packages"
import { createPartner } from "@/routes/partner/create-partner"
import { getPartner } from "@/routes/partner/get-partner"
import { login } from "@/routes/partner/login"
import { paymentMethodRoutes } from "@/routes/payment-method"
import { planRoutes } from "@/routes/plans"
import { publicRoutes } from "@/routes/public"
import { servicesRoutes } from "@/routes/services"
import { subscriptionRoutes } from "@/routes/subscription"
import { createCategory } from "./routes/categories/create-category"
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
app.register(createPartner)
app.register(getPartner)

app.register(appointments)
app.register(getCategories)
app.register(updateCategory)
app.register(deleteCategory)
app.register(createCategory)
app.register(employeesRoutes)
app.register(packagesRoutes)
app.register(planRoutes)
app.register(servicesRoutes)
app.register(availabilityRoutes)
app.register(employeeBlocksRoutes)
app.register(customersRoutes)
app.register(subscriptionRoutes)
app.register(paymentMethodRoutes)
app.register(adminLogin)
app.register(adminRoutes, { prefix: "/admin" })
app.register(publicRoutes, { prefix: "/public" })
app.register(dashboardRoutes)
app.register(establishmentsRoutes)
app.get("/health", async () => {
  return { message: "OK" }
})
app.get("/", async () => {
  return { message: "Hello World" }
})
app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!")
})
