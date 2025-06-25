import z from "zod"

export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  createdAt: z.date(),
  address: z.string().nullable(),
  active: z.boolean(),
  image: z.string().nullable(),
  phone: z.string().nullable(),
})
