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
import { employeeBlocksRoutes } from "@/routes/employee-blocks"
import { availabilityRoutes } from "@/routes/establishment-availability"
import { createPartner } from "@/routes/partner/create-partner"
import { getPartner } from "@/routes/partner/get-partner"
import { login } from "@/routes/partner/login"
import { planRoutes } from "@/routes/plans"
import { subscriptionRoutes } from "@/routes/subscription"
import { paymentMethodRoutes } from "src/routes/payment-method"
import { createCategory } from "./routes/categories/create-category"
import { deleteCategory } from "./routes/categories/delete-category"
import { getCategories } from "./routes/categories/get-categories"
import { updateCategory } from "./routes/categories/update-category"
import { createEmployee } from "./routes/employees/create-employee"
import { deleteEmployee } from "./routes/employees/delete-employee"
import { getEmployee } from "./routes/employees/get-employee"
import { getEmployees } from "./routes/employees/get-employees"
import { updateEmployee } from "./routes/employees/update-employee"
import { createPackage } from "./routes/packages/create-package"
import { deletePackage } from "./routes/packages/delete-package"
import { getPackage } from "./routes/packages/get-package"
import { getPackages } from "./routes/packages/get-packages"
import { updatePackage } from "./routes/packages/update-package"
import { createService } from "./routes/services/create-services"
import { deleteService } from "./routes/services/delete-service"
import { getService } from "./routes/services/get-service"
import { getServices } from "./routes/services/get-services"
import { updateService } from "./routes/services/update-service"
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

app.register(getEmployees)
app.register(getEmployee)
app.register(updateEmployee)
app.register(deleteEmployee)
app.register(createEmployee)

app.register(getPackages)
app.register(getPackage)
app.register(updatePackage)
app.register(deletePackage)
app.register(createPackage)
app.register(getService)
app.register(getServices)
app.register(updateService)
app.register(deleteService)
app.register(createService)
app.register(planRoutes)
app.register(availabilityRoutes)
app.register(employeeBlocksRoutes)
app.register(customersRoutes)
app.register(subscriptionRoutes)
app.register(paymentMethodRoutes)
app.register(adminLogin)
app.register(adminRoutes, { prefix: "/admin" })
app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!")
})
