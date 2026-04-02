/**
 * F15: Billing Types
 *
 * Stripe subscriptions, usage tracking, trial enforcement,
 * dunning, coupons, tax compliance, credits, revenue metrics.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION — workspaces/{workspaceId}/billing/subscription
// ═══════════════════════════════════════════════════════════

export type SubscriptionStatus =
  | 'trialing' | 'active' | 'past_due' | 'canceled'
  | 'unpaid' | 'paused' | 'incomplete' | 'incomplete_expired';

export type BillingInterval = 'monthly' | 'annual';

export interface WorkspaceSubscription {
  workspaceId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  status: SubscriptionStatus;
  tier: string;                        // References Tier from roles.ts
  billingInterval: BillingInterval;
  billingAnchorDay?: number;           // 1-28

  // Period
  currentPeriodStart?: FirestoreTimestamp;
  currentPeriodEnd?: FirestoreTimestamp;
  trialStart?: FirestoreTimestamp;
  trialEnd?: FirestoreTimestamp;

  // Seats
  seatCount: number;
  seatsUsed: number;
  extraSeatPrice?: number;             // Cents per seat per month

  // Amounts
  baseAmount: number;                  // Cents per month
  totalAmount?: number;                // Including seats + tax

  // Tax
  taxRate?: number;                    // Percent
  taxBehavior?: 'inclusive' | 'exclusive';
  taxId?: string;                      // Customer's VAT/GST
  taxIdVerified?: boolean;
  taxExempt?: boolean;
  taxExemptCertificateUrl?: string;
  billingCountry?: string;
  reverseCharge?: boolean;             // EU B2B cross-border

  // Cancellation
  cancelAtPeriodEnd?: boolean;
  canceledAt?: FirestoreTimestamp;
  cancellationReason?: string;

  // Proration
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';

  // Payment
  defaultPaymentMethodId?: string;
  paymentMethods?: PaymentMethod[];
  latestInvoiceId?: string;

  // Coupon
  couponId?: string;
  discountType?: 'percent_off' | 'amount_off';
  discountValue?: number;
  discountDuration?: 'once' | 'repeating' | 'forever';
  discountDurationMonths?: number;

  // Self-service portal
  selfServiceEnabled: boolean;
  allowedActions?: ('change_plan' | 'cancel' | 'update_payment' | 'download_invoices')[];

  // Metadata
  dataSource: 'live' | 'mock';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'wire';
  isDefault: boolean;
  last4?: string;
  brand?: string;                      // visa, mastercard, amex
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
}

// ═══════════════════════════════════════════════════════════
// INVOICE — workspaces/{workspaceId}/billing/invoices/{invoiceId}
// ═══════════════════════════════════════════════════════════

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  workspaceId: string;
  stripeInvoiceId?: string;
  status: InvoiceStatus;
  amountDue: number;                   // Cents
  amountPaid: number;
  currency: string;                    // ISO 4217
  periodStart: FirestoreTimestamp;
  periodEnd: FirestoreTimestamp;
  dueDate?: FirestoreTimestamp;
  paidAt?: FirestoreTimestamp;
  hostedInvoiceUrl?: string;           // Stripe hosted invoice page
  invoicePdfUrl?: string;
  lineItems?: InvoiceLineItem[];
  createdAt: FirestoreTimestamp;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmount: number;                  // Cents
  amount: number;                      // Cents (quantity * unitAmount)
}

// ═══════════════════════════════════════════════════════════
// USAGE — workspaces/{workspaceId}/billing/usage/{date}
// Daily snapshot of resource usage for cap enforcement.
// ═══════════════════════════════════════════════════════════

export interface UsageSnapshot {
  workspaceId: string;
  date: string;                        // YYYY-MM-DD
  contentDrafts: number;
  publishJobs: number;
  imageGenerations: number;
  emailCampaigns: number;
  leadRecords: number;
  seoLookups: number;
  teamMembers: number;
  clientWorkspaces: number;
  storageMb: number;
  apiCalls?: number;
  aiTokensConsumed?: number;
  createdAt: FirestoreTimestamp;
}

// ─── Usage Caps per Tier ────────────────────────────────────
export interface UsageCaps {
  contentDrafts: number;
  publishJobs: number;
  imageGenerations: number;
  emailCampaigns: number;
  leadRecords: number;
  seoLookups: number;
  teamMembers: number;
  clientWorkspaces: number;
  storageMb: number;
}

export const TRIAL_USAGE_CAPS: UsageCaps = {
  contentDrafts: 20,
  publishJobs: 5,
  imageGenerations: 10,
  emailCampaigns: 2,
  leadRecords: 50,
  seoLookups: 20,
  teamMembers: 3,
  clientWorkspaces: 1,
  storageMb: 500,
};

// ─── Usage Alert ────────────────────────────────────────────
export interface UsageAlert {
  metricId: string;
  thresholdPercent: number;            // 75, 90, 100
  notifiedAt?: FirestoreTimestamp;
  currentUsage: number;
  limit: number;
}

// ═══════════════════════════════════════════════════════════
// DUNNING — retry management for failed payments
// ═══════════════════════════════════════════════════════════

export type DunningStatus = 'none' | 'in_retry' | 'grace_period' | 'exhausted';

export interface DunningState {
  workspaceId: string;
  status: DunningStatus;
  retrySchedule: {
    attemptNumber: number;
    retryAt: FirestoreTimestamp;
    status: 'pending' | 'failed' | 'succeeded';
  }[];
  maxRetryAttempts: number;
  retryIntervalDays: number[];         // e.g., [1, 3, 5, 7]
  gracePeriodDays: number;
  gracePeriodEndAt?: FirestoreTimestamp;
  onExhaustedAction: 'cancel' | 'downgrade_to_free' | 'pause' | 'mark_unpaid';
  lastPaymentFailureReason?: string;
  customerNotifiedAt?: FirestoreTimestamp[];
  dunningEmailsSent: number;
}

// ═══════════════════════════════════════════════════════════
// COUPON / PROMOTION
// ═══════════════════════════════════════════════════════════

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent_off' | 'amount_off';
  discountValue: number;               // Percent or cents
  appliesTo: 'all_plans' | 'specific_plans';
  applicablePlanIds?: string[];
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  validFrom?: FirestoreTimestamp;
  validUntil?: FirestoreTimestamp;
  isActive: boolean;
  createdAt: FirestoreTimestamp;
}

export interface ReferralCredits {
  referralCode: string;
  referrerRewardCents: number;
  refereeDiscountPercent: number;
  referredBy?: string;                 // userId
  appliedAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// CREDIT SYSTEM
// ═══════════════════════════════════════════════════════════

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'expiry' | 'promotional';

export interface CreditTransaction {
  id: string;
  amount: number;                      // Positive = add, negative = deduct
  type: CreditTransactionType;
  description: string;
  timestamp: FirestoreTimestamp;
  expiresAt?: FirestoreTimestamp;
}

export interface CreditBalance {
  workspaceId: string;
  balance: number;                     // Current credit balance (cents)
  transactions: CreditTransaction[];
  expiryPolicy?: {
    enabled: boolean;
    daysToExpiry: number;
  };
}

// ═══════════════════════════════════════════════════════════
// REVENUE METRICS (admin panel — daily snapshots)
// ═══════════════════════════════════════════════════════════

export interface RevenueSnapshot {
  date: string;                        // YYYY-MM-DD
  mrr: number;                         // Monthly recurring revenue (cents)
  arr: number;                         // Annual (mrr * 12)
  activeSubscriptions: number;
  trialCount: number;
  churnedCount: number;
  newCount: number;
  expansionRevenue: number;            // From upgrades + seat additions
  contractionRevenue: number;          // From downgrades
  netNewMrr: number;                   // new + expansion - contraction - churn
  customerChurnRate: number;           // 0-1
  arpu: number;                        // Average revenue per user
  ltv: number;                         // Lifetime value estimate
  createdAt: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// TIER CAPABILITY MAP
// ═══════════════════════════════════════════════════════════

export interface TierCapabilities {
  tier: string;
  features: string[];                  // Feature IDs: 'F1', 'F2', etc.
  usageCaps: UsageCaps;
  basePrice: number;                   // Cents per month
  includedSeats: number;
  extraSeatPrice: number;              // Cents per seat per month
}

export const TIER_CAPABILITIES: TierCapabilities[] = [
  {
    tier: 'starter',
    features: ['F1', 'F2', 'F3', 'F4', 'F5', 'F8'],
    usageCaps: { contentDrafts: 50, publishJobs: 20, imageGenerations: 0, emailCampaigns: 0, leadRecords: 0, seoLookups: 0, teamMembers: 1, clientWorkspaces: 0, storageMb: 1000 },
    basePrice: 2900, includedSeats: 1, extraSeatPrice: 1500,
  },
  {
    tier: 'growth',
    features: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F10', 'F11'],
    usageCaps: { contentDrafts: 200, publishJobs: 100, imageGenerations: 0, emailCampaigns: 10, leadRecords: 500, seoLookups: 100, teamMembers: 5, clientWorkspaces: 0, storageMb: 5000 },
    basePrice: 7900, includedSeats: 5, extraSeatPrice: 1200,
  },
  {
    tier: 'agency',
    features: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14'],
    usageCaps: { contentDrafts: 1000, publishJobs: 500, imageGenerations: 100, emailCampaigns: 50, leadRecords: 2000, seoLookups: 500, teamMembers: 10, clientWorkspaces: 10, storageMb: 20000 },
    basePrice: 19900, includedSeats: 10, extraSeatPrice: 1000,
  },
  {
    tier: 'agency_pro',
    features: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'],
    usageCaps: { contentDrafts: 5000, publishJobs: 2000, imageGenerations: 500, emailCampaigns: 200, leadRecords: 10000, seoLookups: 2000, teamMembers: 25, clientWorkspaces: 50, storageMb: 100000 },
    basePrice: 39900, includedSeats: 25, extraSeatPrice: 800,
  },
  {
    tier: 'white_label',
    features: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'],
    usageCaps: { contentDrafts: -1, publishJobs: -1, imageGenerations: -1, emailCampaigns: -1, leadRecords: -1, seoLookups: -1, teamMembers: -1, clientWorkspaces: -1, storageMb: -1 }, // -1 = unlimited
    basePrice: 79900, includedSeats: -1, extraSeatPrice: 0,
  },
];
