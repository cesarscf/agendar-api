import z from "zod"

export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.string(),
  active: z.boolean(),
  durationInMinutes: z.number(),
  description: z.string().nullish(),
  image: z.string().nullish(),
})
