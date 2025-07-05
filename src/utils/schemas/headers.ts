import z from "zod"

export const establishmentHeaderSchema = z.object({
  "x-establishment-id": z.string().optional(),
})
