import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  tier: z.enum(['starter', 'growth', 'agency', 'agency_pro', 'white_label']),
  billingInterval: z.enum(['monthly', 'annual']),
  seatCount: z.number().int().min(1).max(500).optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1).max(50),
});
