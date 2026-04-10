/**
 * Algorithm Change Alerts Service
 * Monitors platform changes, generates impact analysis, manages notifications.
 * Production: RSS feed polling + AI summarization. Dev: mock alerts.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { AlertPlatform, AlertCategory, AlertSeverity } from '@/types/features/platform-alerts';

const alertsCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('platform_alerts');
const prefsDoc = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('settings').doc('alert_preferences');

// ── Alert CRUD ─────────────────────────────────────────────

export async function listAlerts(workspaceId: string, filters: { platform?: string; status?: string; severity?: string; limit?: number } = {}) {
  let query = alertsCol(workspaceId).limit(filters.limit ?? 30) as FirebaseFirestore.Query;
  if (filters.platform) query = query.where('platform', '==', filters.platform);
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.severity) query = query.where('severity', '==', filters.severity);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markAlertRead(workspaceId: string, alertId: string) {
  await alertsCol(workspaceId).doc(alertId).update({ status: 'read', readAt: FieldValue.serverTimestamp() });
}

export async function dismissAlert(workspaceId: string, alertId: string) {
  await alertsCol(workspaceId).doc(alertId).update({ status: 'dismissed' });
}

// ── Preferences ────────────────────────────────────────────

export async function getAlertPreferences(workspaceId: string) {
  const doc = await prefsDoc(workspaceId).get();
  return doc.exists ? doc.data() : {
    emailDigest: 'weekly',
    enabledPlatforms: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest', 'google'],
    enabledCategories: ['algorithm_change', 'policy_update', 'new_feature', 'deprecation', 'api_change'],
    minSeverity: 'informational',
  };
}

export async function updateAlertPreferences(workspaceId: string, prefs: Record<string, unknown>) {
  await prefsDoc(workspaceId).set({ workspaceId, ...prefs, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ── Seed Mock Alerts (dev) ─────────────────────────────────

export async function seedMockAlerts(workspaceId: string) {
  const MOCK_ALERTS: { platform: AlertPlatform; category: AlertCategory; severity: AlertSeverity; title: string; summary: string; details: string; sourceDate: string; impactAnalysis: string; actionItems: string[]; affectedFeatures: string[] }[] = [
    {
      platform: 'instagram', category: 'algorithm_change', severity: 'critical',
      title: 'Instagram Reels Algorithm Update — Reach Calculation Changed',
      summary: 'Instagram has updated how Reels reach is calculated. Non-follower reach now weighted 40% by watch time (up from 25%). Shares count 3x more than likes.',
      details: 'Starting April 2026, Instagram\'s Reels algorithm prioritizes watch time and shares over likes and comments. Content that keeps viewers watching past the 3-second mark gets significantly boosted in non-follower feeds.',
      sourceDate: '2026-04-05',
      impactAnalysis: 'Your scheduled Instagram Reels should be optimized for watch time. Front-load the hook in the first 3 seconds. Encourage shares by adding "share with someone who..." CTAs. Your current content strategy focuses on static images — consider shifting 30% of posts to Reels.',
      actionItems: ['Review scheduled Reels and ensure strong hooks in first 3 seconds', 'Add "share this with..." CTAs to Reel captions', 'Shift 30% of Instagram content from static posts to Reels', 'Monitor Reels reach for the next 2 weeks to measure impact'],
      affectedFeatures: ['publishing', 'content_calendar', 'analytics'],
    },
    {
      platform: 'linkedin', category: 'new_feature', severity: 'important',
      title: 'LinkedIn Launches Article Newsletters for All Creator Profiles',
      summary: 'LinkedIn now allows all profiles (not just company pages) to create newsletter subscriptions. Subscribers get email + in-app notifications for every issue.',
      details: 'LinkedIn has expanded its Newsletter feature to all individual profiles with Creator Mode enabled. This means your freelancer and agency team members can build newsletter audiences directly on LinkedIn.',
      sourceDate: '2026-04-02',
      impactAnalysis: 'This is a new distribution channel for your content. LinkedIn newsletter subscribers get both email and push notifications — much higher reach than regular posts (3-5x). Consider repurposing your blog posts as LinkedIn newsletters.',
      actionItems: ['Enable Creator Mode on your LinkedIn profile', 'Create a LinkedIn Newsletter with your brand name', 'Repurpose top blog posts as newsletter issues', 'Add newsletter subscription CTA to your LinkedIn profile'],
      affectedFeatures: ['publishing', 'content_repurposing', 'email'],
    },
    {
      platform: 'google', category: 'algorithm_change', severity: 'critical',
      title: 'Google AI Overviews Now Appear for 50% of Queries',
      summary: 'Google has expanded AI Overviews from 40% to 50% of search queries. AI-generated summaries now appear above organic results for half of all searches.',
      details: 'Google\'s AI Overview expansion means that traditional organic rankings matter less for informational queries. Content must now be optimized for both traditional SEO AND AI citability (GEO).',
      sourceDate: '2026-04-08',
      impactAnalysis: 'Your SEO strategy needs a GEO companion. Content optimized only for traditional SEO will lose click-through as AI summaries answer queries directly. Use Aura\'s GEO module to score content for AI citability — aim for 80+ on the GEO score.',
      actionItems: ['Score all published content with GEO citability scorer', 'Add FAQ-style headings (questions as H2s) to blog posts', 'Include original data and "According to our research..." statements', 'Generate schema markup (Article, FAQ) for all key pages', 'Create /llms.txt file for your website'],
      affectedFeatures: ['seo', 'geo', 'blog', 'content_creation'],
    },
    {
      platform: 'tiktok', category: 'policy_update', severity: 'important',
      title: 'TikTok Updates Commercial Content Policy — Disclosure Required',
      summary: 'TikTok now requires explicit disclosure labels for all commercial content, including organic posts about your own products/services.',
      details: 'Effective May 2026, TikTok requires the "Promotional content" toggle for ANY content that promotes a product or service — even your own. Failure to disclose may result in reduced distribution or account penalties.',
      sourceDate: '2026-04-01',
      impactAnalysis: 'All your TikTok posts promoting products or services need the promotional content toggle enabled. This may slightly reduce organic reach but protects your account from penalties. Update your publishing workflow to include this step.',
      actionItems: ['Enable "Promotional content" toggle on all commercial TikTok posts', 'Update content calendar templates to include disclosure reminder', 'Train team members on new disclosure requirements', 'Audit recent posts for compliance'],
      affectedFeatures: ['publishing', 'compliance'],
    },
    {
      platform: 'twitter', category: 'api_change', severity: 'informational',
      title: 'X/Twitter API v2.1 — New Analytics Endpoints Available',
      summary: 'X has released API v2.1 with improved analytics endpoints including impression-to-engagement funnel data and follower demographics.',
      details: 'The new API version provides more granular analytics data than previously available. Agencies can now pull impression breakdowns, engagement funnels, and follower demographics directly from the API.',
      sourceDate: '2026-03-28',
      impactAnalysis: 'When Aura updates to the v2.1 API, you\'ll have access to richer analytics for X/Twitter. No action needed on your part — this is an infrastructure improvement.',
      actionItems: ['No action needed — Aura will update automatically'],
      affectedFeatures: ['analytics', 'integrations'],
    },
    {
      platform: 'facebook', category: 'deprecation', severity: 'important',
      title: 'Facebook Deprecates "Boost Post" API — Use Ads Manager Instead',
      summary: 'Facebook is removing the "Boost Post" API endpoint. All paid amplification must go through Ads Manager API by June 2026.',
      details: 'Meta is consolidating all paid advertising into the Ads Manager API. The simple "Boost" endpoint (used by many scheduling tools) will stop working June 30, 2026.',
      sourceDate: '2026-03-25',
      impactAnalysis: 'If you use boosted posts through Aura, you\'ll need to use the Ad Campaigns feature instead. Boosted posts created before June 2026 will continue running, but new boosts must use the full ads workflow.',
      actionItems: ['Switch from "Boost Post" to "Ad Campaigns" for paid Facebook content', 'Review any automated boost rules and migrate to ad campaigns', 'No impact on organic Facebook publishing'],
      affectedFeatures: ['ads', 'publishing'],
    },
  ];

  const batch = adminDb.batch();
  for (const alert of MOCK_ALERTS) {
    const ref = alertsCol(workspaceId).doc();
    batch.set(ref, {
      id: ref.id, workspaceId, ...alert,
      status: 'unread', sourceUrl: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  return MOCK_ALERTS.length;
}
