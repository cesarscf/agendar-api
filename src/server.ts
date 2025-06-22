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
import { createCategory } from "./routes/categories/create-category"
import { deleteCategory } from "./routes/categories/delete-category"
import { getCategories } from "./routes/categories/get-categories"
import { updateCategory } from "./routes/categories/update-category"
import { createEmployee } from "./routes/employees/create-employee"

import { createCustomer } from "./routes/customers/create-customer"
import { deleteCustomer } from "./routes/customers/delete-customer"
import { getCustomer } from "./routes/customers/get-customer"
import { getCustomers } from "./routes/customers/get-customers"
import { updateCustomer } from "./routes/customers/update-customer"
import { deleteEmployee } from "./routes/employees/delete-category"
import { getEmployee } from "./routes/employees/get-employee"
import { getEmployees } from "./routes/employees/get-employees"
import { updateEmployee } from "./routes/employees/update-employee"
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
app.register(createCategory)

app.register(getEmployees)
app.register(getEmployee)
app.register(updateEmployee)
app.register(deleteEmployee)
app.register(createEmployee)

app.register(getCustomers)
app.register(getCustomer)
app.register(updateCustomer)
app.register(deleteCustomer)
app.register(createCustomer)

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!")
})
