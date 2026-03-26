// src/modules/pricing-combinations/pricing-combinations.model.ts
export interface PricingCombination {
  id: string;
  tier: number;
  duration: number;
  distance: number;
  type: 'Base' | 'Extra KM';
  price: number;
  per_km_rate: number;
  created_at: Date;
  updated_at: Date;
}
