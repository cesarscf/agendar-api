const plans = [
  {
    name: "1_profissional",
    priceId: "price_1p_mensal", 
    // Semestral (10% OFF)
    semestralDiscountPriceId: "price_1p_semestral", 
    // Anual (20% OFF)
    annualDiscountPriceId: "price_1p_anual",
    price: 79.90,
    limits: {
      professionals: 1
    }
  },
  {
    name: "2_a_7_profissionais",
    priceId: "price_2a7_mensal",
    // Semestral (10% OFF)
    semestralDiscountPriceId: "price_2a7_semestral",
    // Anual (20% OFF)
    annualDiscountPriceId: "price_2a7_anual",
    price: 99.70,
    limits: {
      professionals: 7
    }
  },
  {
    name: "8_a_15_profissionais",
    priceId: "price_8a15_mensal",
    // Semestral (10% OFF)
    semestralDiscountPriceId: "price_8a15_semestral",
    // Anual (20% OFF)
    annualDiscountPriceId: "price_8a15_anual",
    price: 164.90,
    limits: {
      professionals: 15
    }
  },
  {
    name: "acima_de_15_profissionais",
    priceId: "price_15plus_mensal",
    // Semestral (10% OFF)
    semestralDiscountPriceId: "price_15plus_semestral",
    // Anual (20% OFF)
    annualDiscountPriceId: "price_15plus_anual",
    price: 219.90,
    limits: {
      professionals: "unlimited" 
    }
  }
];
