import z from "zod"

export const establishmentHeaderSchema = z.object({
  "establishment-id": z.string(),
})
