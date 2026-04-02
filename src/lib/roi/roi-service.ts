/**
 * Content ROI Calculation Service
 * Pure internal calculation — no external API needed.
 */

export interface ContentROI {
  contentId: string;
  title: string;
  creationCostCents: number;           // Estimated from time tracking or fixed
  adSpendCents: number;                // If boosted/promoted
  totalCostCents: number;
  impressions: number;
  engagement: number;
  clicks: number;
  estimatedReachValue: number;         // CPM-based estimated value
  earnedMediaValueCents: number;       // Based on equivalent ad spend
  roi: number;                         // (value - cost) / cost * 100
}

/**
 * Calculate ROI for a piece of content.
 * Uses industry-average CPM ($5-15) to estimate earned media value.
 */
export function calculateContentROI(
  contentId: string,
  title: string,
  impressions: number,
  engagement: number,
  clicks: number,
  creationTimeMinutes: number = 60,
  hourlyRateCents: number = 5000,       // Default $50/hr
  adSpendCents: number = 0,
  industryCpmCents: number = 1000,      // $10 CPM default
): ContentROI {
  const creationCostCents = Math.round((creationTimeMinutes / 60) * hourlyRateCents);
  const totalCostCents = creationCostCents + adSpendCents;

  // Earned media value: impressions × CPM / 1000
  const earnedMediaValueCents = Math.round((impressions / 1000) * industryCpmCents);

  // Engagement bonus: each engagement worth ~$0.50 in equivalent value
  const engagementValueCents = engagement * 50;

  // Click value: each click worth ~$1.00 in equivalent value
  const clickValueCents = clicks * 100;

  const totalValueCents = earnedMediaValueCents + engagementValueCents + clickValueCents;
  const roi = totalCostCents > 0 ? Math.round(((totalValueCents - totalCostCents) / totalCostCents) * 100) : 0;

  return {
    contentId,
    title,
    creationCostCents,
    adSpendCents,
    totalCostCents,
    impressions,
    engagement,
    clicks,
    estimatedReachValue: earnedMediaValueCents,
    earnedMediaValueCents: totalValueCents,
    roi,
  };
}
