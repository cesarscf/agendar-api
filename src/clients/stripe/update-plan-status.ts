import { stripe } from "@/clients/stripe/index"

export function updatePlanStatusOnStripe(planId: string, isActive: boolean) {
  return stripe.products.update(planId, {
    active: isActive,
  })
}
