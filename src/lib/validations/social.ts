/**
 * F9 + F5 Zod Schemas
 */

import { z } from 'zod';

export const socialPlatformEnum = z.enum([
  'linkedin', 'twitter', 'instagram', 'facebook',
  'google_business', 'tiktok', 'youtube', 'pinterest',
]);

// F9: Connect account (mock for dev)
export const connectAccountSchema = z.object({
  platform: socialPlatformEnum,
  // In production, these come from OAuth callback. For mock, provided directly.
  mockData: z.object({
    platformAccountId: z.string().optional(),
    platformUsername: z.string().optional(),
    platformDisplayName: z.string().optional(),
    accountType: z.enum(['personal', 'page', 'business', 'channel', 'creator']).optional(),
    followerCount: z.number().optional(),
  }).optional(),
});

export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;

export const disconnectAccountSchema = z.object({
  connectionId: z.string().min(1),
});

// F5: Analytics query
export const analyticsQuerySchema = z.object({
  dateRange: z.enum(['last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  platform: socialPlatformEnum.optional(),
  clientId: z.string().optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;

// Anomaly alert config
export const anomalyAlertConfigSchema = z.object({
  enabled: z.boolean(),
  thresholds: z.record(z.string(), z.object({
    deviationPercent: z.number().min(5).max(100),
    minAbsoluteChange: z.number().min(0),
  })).optional(),
  notifyRoles: z.array(z.string()).optional(),
  baselinePeriodDays: z.number().int().min(7).max(90).optional(),
});
