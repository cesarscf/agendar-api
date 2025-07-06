import z from "zod"

export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  active: z.boolean(),
  avatarUrl: z.string().nullable(),
  phone: z.string().nullable(),
  biography: z.string().nullable(),
})
