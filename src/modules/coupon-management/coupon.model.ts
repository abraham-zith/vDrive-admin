export interface Coupon {
  id?: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED' | 'FREE_RIDE';
  discount_value: number;
  min_ride_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  valid_from: Date | string;
  valid_until: Date | string;
  applicable_ride_types?: any;
  user_eligibility?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CouponUsage {
  id?: string;
  coupon_id: string;
  user_id: string;
  trip_id: string;
  discount_applied: number;
  used_at?: Date;
}
