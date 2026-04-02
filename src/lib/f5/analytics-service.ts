/**
 * F5: Analytics Service
 *
 * Creates daily snapshots, serves dashboard metrics,
 * and generates mock data for development.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { SocialPlatform, PipelineHealth, ComparisonDelta, ContentTypeBreakdown } from '@/types/features/social';

// ─── Get Dashboard Metrics ──────────────────────────────────

export async function getDashboardMetrics(
  workspaceId: string,
  dateRange: string = 'last_30_days',
  platform?: string,
  clientId?: string,
): Promise<{
  kpis: Record<string, unknown>;
  chartData: Record<string, unknown>[];
  pipelineHealth: PipelineHealth;
  topPosts: Record<string, unknown>[];
}> {
  const { from, to } = getDateRange(dateRange);

  // Fetch analytics snapshots for the period
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('analytics_snapshots')
    .where('date', '>=', from)
    .where('date', '<=', to)
    .orderBy('date', 'asc')
    .limit(200) as FirebaseFirestore.Query;

  if (platform) query = query.where('platform', '==', platform);

  const snapshot = await query.get();

  if (snapshot.empty) {
    // Generate mock data if no real data exists
    return generateMockDashboardData(workspaceId, from, to);
  }

  const snapshots = snapshot.docs.map((doc) => doc.data());

  // Aggregate KPIs
  const totalImpressions = snapshots.reduce((sum, s) => sum + (s.impressions ?? 0), 0);
  const totalEngagement = snapshots.reduce((sum, s) => sum + (s.engagement ?? 0), 0);
  const totalClicks = snapshots.reduce((sum, s) => sum + (s.clicks ?? 0), 0);
  const totalPublished = snapshots.reduce((sum, s) => sum + (s.contentPublishedCount ?? 0), 0);
  const avgEngagementRate = totalImpressions > 0 ? totalEngagement / totalImpressions : 0;

  // Get pipeline health from content_drafts
  const pipelineHealth = await getContentPipelineHealth(workspaceId, clientId);

  return {
    kpis: {
      impressions: totalImpressions,
      engagement: totalEngagement,
      clicks: totalClicks,
      engagementRate: avgEngagementRate,
      contentPublished: totalPublished,
      followerDelta: snapshots.reduce((sum, s) => sum + (s.followerDelta ?? 0), 0),
    },
    chartData: snapshots.map((s) => ({
      date: s.date,
      platform: s.platform,
      impressions: s.impressions ?? 0,
      engagement: s.engagement ?? 0,
      clicks: s.clicks ?? 0,
    })),
    pipelineHealth,
    topPosts: [],
  };
}

// ─── Pipeline Health ────────────────────────────────────────

async function getContentPipelineHealth(
  workspaceId: string,
  clientId?: string,
): Promise<PipelineHealth> {
  const draftsRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts');

  const statuses = ['draft', 'submitted', 'approved', 'scheduled', 'published', 'rejected', 'archived'];
  const health: PipelineHealth = {
    draft: 0, submitted: 0, approved: 0, scheduled: 0, published: 0, rejected: 0, archived: 0,
  };

  for (const status of statuses) {
    let q = draftsRef.where('status', '==', status) as FirebaseFirestore.Query;
    if (clientId) q = q.where('clientId', '==', clientId);
    const snap = await q.count().get();
    health[status as keyof PipelineHealth] = snap.data().count;
  }

  return health;
}

// ─── Create Daily Snapshot ──────────────────────────────────

export async function createDailySnapshot(
  workspaceId: string,
  platform: SocialPlatform | 'all',
  date: string,
  metrics: Record<string, unknown>,
): Promise<string> {
  const docId = `${date}_${platform}`;
  const ref = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('analytics_snapshots')
    .doc(docId);

  await ref.set({
    id: docId,
    workspaceId,
    platform,
    date,
    periodType: 'daily',
    dataSource: 'mock',
    ...metrics,
    syncedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return docId;
}

// ─── Mock Data Generator ────────────────────────────────────

function generateMockDashboardData(
  workspaceId: string,
  from: string,
  to: string,
): {
  kpis: Record<string, unknown>;
  chartData: Record<string, unknown>[];
  pipelineHealth: PipelineHealth;
  topPosts: Record<string, unknown>[];
} {
  const days = getDaysBetween(from, to);
  const chartData: Record<string, unknown>[] = [];

  let totalImpressions = 0;
  let totalEngagement = 0;
  let totalClicks = 0;

  for (const day of days) {
    const impressions = 500 + Math.floor(Math.random() * 2000);
    const engagement = Math.floor(impressions * (0.02 + Math.random() * 0.06));
    const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.03));

    totalImpressions += impressions;
    totalEngagement += engagement;
    totalClicks += clicks;

    chartData.push({
      date: day,
      platform: 'all',
      impressions,
      engagement,
      clicks,
    });
  }

  return {
    kpis: {
      impressions: totalImpressions,
      engagement: totalEngagement,
      clicks: totalClicks,
      engagementRate: totalImpressions > 0 ? totalEngagement / totalImpressions : 0,
      contentPublished: Math.floor(days.length * 0.7),
      followerDelta: Math.floor(Math.random() * 200) - 20,
    },
    chartData,
    pipelineHealth: {
      draft: 8, submitted: 3, approved: 5, scheduled: 2, published: 12, rejected: 1, archived: 4,
    },
    topPosts: [
      { id: 'mock_1', title: 'Top performing mock post', engagement: 245, platform: 'linkedin' },
      { id: 'mock_2', title: 'Second best mock post', engagement: 189, platform: 'instagram' },
      { id: 'mock_3', title: 'Third mock post', engagement: 142, platform: 'twitter' },
    ],
  };
}

// ─── Date Helpers ───────────────────────────────────────────

function getDateRange(range: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from: string;

  switch (range) {
    case 'last_7_days': from = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]; break;
    case 'last_30_days': from = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]; break;
    case 'last_90_days': from = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]; break;
    case 'this_month': from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; break;
    case 'last_month': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      from = lm.toISOString().split('T')[0];
      break;
    }
    default: from = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
  }

  return { from, to };
}

function getDaysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const current = new Date(start);

  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
}
