import { env } from "@/env"
import type { Config } from "drizzle-kit"

export default {
  schema: "src/db/schema/index.ts",
  out: "drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config
