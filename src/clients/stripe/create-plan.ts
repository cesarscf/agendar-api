import { stripe } from "@/clients/stripe/index"

export async function createPlanOnStripe(
  name: string,
  amount: number,
  interval: number,
  trialPeriodInDays: number
) {
  const product = await stripe.products.create({ name })

  const price = await stripe.prices.create({
    unit_amount: amount,
    currency: "brl",
    recurring: {
      interval: interval === 12 ? "year" : "month",
      interval_count: interval === 12 ? 1 : interval,
      trial_period_days: trialPeriodInDays,
    },
    product: product.id,
    active: true,
  })

  await stripe.products.update(product.id, {
    default_price: price.id,
  })

  return { price, product }
}
