import z from "zod"

export const packageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  commission: z.string(),
  price: z.string(),
  image: z.string().nullish(),
})
