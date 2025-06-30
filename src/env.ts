import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  APP_URL: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  NODE_ENV: z.string(),
})

export const env = envSchema.parse(process.env)
