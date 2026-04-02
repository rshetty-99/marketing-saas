/**
 * Tier-based feature gating.
 * Prevents access to features not included in the workspace's tier.
 * Checks both feature access and usage limits.
 */

import { adminDb } from '@/lib/firebase/admin';
import { TIER_CAPABILITIES, TRIAL_USAGE_CAPS } from '@/types/features/billing';
import type { UsageCaps } from '@/types/features/billing';

/**
 * Map of sidebar route prefixes to feature IDs.
 * Used by dashboard layout to gate page access.
 */
export const ROUTE_FEATURE_MAP: Record<string, string> = {
  '/dashboard/content': 'F1',
  '/dashboard/approvals': 'F6',
  '/dashboard/calendar': 'F4',
  '/dashboard/analytics': 'F5',
  '/dashboard/reports': 'F5',
  '/dashboard/brand': 'F8',
  '/dashboard/team': 'F7',
  '/dashboard/settings': 'F7',
  '/dashboard/integrations': 'F9',
  '/dashboard/seo': 'F10',
  '/dashboard/email': 'F11',
  '/dashboard/leads': 'F12',
  '/dashboard/images': 'F13',
  '/dashboard/clients': 'F14',
  '/dashboard/billing': 'F15',
  '/dashboard/assets': 'F16',
};

/**
 * Check if a tier has access to a specific feature.
 */
export function tierHasFeature(tier: string, featureId: string): boolean {
  // Trial has access to all features (with usage caps)
  if (tier === 'trial') return true;

  const tierConfig = TIER_CAPABILITIES.find((t) => t.tier === tier);
  if (!tierConfig) return false;

  return tierConfig.features.includes(featureId);
}

/**
 * Get the feature ID for a dashboard route.
 */
export function getFeatureForRoute(pathname: string): string | null {
  for (const [prefix, featureId] of Object.entries(ROUTE_FEATURE_MAP)) {
    if (pathname.startsWith(prefix)) return featureId;
  }
  return null;
}

/**
 * Check if a workspace can access a route based on its tier.
 * Returns null if allowed, or an error message if blocked.
 */
export async function checkTierAccess(
  workspaceId: string,
  pathname: string,
): Promise<{ allowed: boolean; reason?: string; upgradeTier?: string }> {
  const featureId = getFeatureForRoute(pathname);
  if (!featureId) return { allowed: true }; // No feature gate for this route

  const wsDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
  const wsData = wsDoc.data();
  const tier = wsData?.tier ?? 'starter';
  const status = wsData?.status ?? 'trial';

  // Trial workspaces can access all features (with usage caps)
  if (status === 'trial') return { allowed: true };

  // Soft-locked workspaces can only view, not create
  if (status === 'soft_locked') {
    return {
      allowed: false,
      reason: 'Your trial has expired. Upgrade to continue.',
      upgradeTier: 'starter',
    };
  }

  if (tierHasFeature(tier, featureId)) {
    return { allowed: true };
  }

  // Find the minimum tier that includes this feature
  const requiredTier = TIER_CAPABILITIES.find((t) => t.features.includes(featureId));

  return {
    allowed: false,
    reason: `${featureId} requires the ${requiredTier?.tier ?? 'higher'} plan or above.`,
    upgradeTier: requiredTier?.tier,
  };
}

/**
 * Get usage caps for a workspace based on its tier and status.
 */
export function getWorkspaceUsageCaps(tier: string, status: string): UsageCaps {
  if (status === 'trial') return TRIAL_USAGE_CAPS;
  const tierConfig = TIER_CAPABILITIES.find((t) => t.tier === tier);
  if (tierConfig) return tierConfig.usageCaps;
  return TRIAL_USAGE_CAPS;
}
