import z from "zod"

export const establishmentHeaderSchema = z.object({
  "x-establishment-id": z.string().optional(),
})

export const customerHeaderSchema = z.object({
  "x-customer-phone": z.string().optional(),
})
