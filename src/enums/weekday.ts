import { z } from "zod"

export const WeekdaySchema = z.number().int().min(0).max(6)
