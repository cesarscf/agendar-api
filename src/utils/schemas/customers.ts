import { z } from "zod"

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  birthDate: z.coerce.date(),
  phoneNumber: z.string(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  cpf: z.string().nullable(),
  notes: z.string().nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
})
