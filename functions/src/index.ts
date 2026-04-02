/**
 * Aura.ai Cloud Functions
 *
 * 8 functions — 7 are HTTP-callable (manually triggered until go-live),
 * 1 is a Firestore trigger (publishScheduled — fires on doc creation).
 *
 * To enable scheduled execution for go-live, change onRequest → onSchedule
 * and add schedule config. See production-readiness.md for schedule values.
 *
 * Deploy: cd functions && npm run build && firebase deploy --only functions
 */

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════
// 1. TRIAL ENFORCEMENT — manually callable until go-live
// Go-live schedule: daily at 2am UTC ('0 2 * * *')
// ═══════════════════════════════════════════════════════════

export const trialEnforcement = onRequest(async (_req, res) => {
  logger.info('Running trial enforcement check');
  const now = admin.firestore.Timestamp.now();

  const expiredTrials = await db
    .collection('workspaces')
    .where('status', '==', 'trial')
    .where('trialEndsAt', '<=', now)
    .get();

  let locked = 0;
  for (const ws of expiredTrials.docs) {
    await ws.ref.update({
      status: 'soft_locked',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    locked++;
    logger.info(`Soft-locked workspace: ${ws.id} (${ws.data().name})`);
  }

  res.json({ success: true, locked });
});

// ═══════════════════════════════════════════════════════════
// 2. TOKEN REFRESH — manually callable until go-live
// Go-live schedule: hourly ('0 * * * *')
// ═══════════════════════════════════════════════════════════

export const tokenRefresh = onRequest(async (_req, res) => {
  logger.info('Running token refresh check');
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const workspaces = await db.collection('workspaces').get();
  let refreshed = 0;

  for (const ws of workspaces.docs) {
    const connections = await db
      .collection('workspaces').doc(ws.id)
      .collection('social_connections')
      .where('status', '==', 'active').get();

    for (const conn of connections.docs) {
      const expiresAt = conn.data().tokenExpiresAt?.toDate?.();
      if (expiresAt && expiresAt < cutoff) {
        await conn.ref.update({
          healthStatus: 'warning',
          lastSyncStatus: 'token_expiring',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        refreshed++;
      }
    }
  }

  res.json({ success: true, refreshed });
});

// ═══════════════════════════════════════════════════════════
// 3. METRICS POLLER — manually callable until go-live
// Go-live schedule: every 6 hours ('0 */6 * * *')
// ═══════════════════════════════════════════════════════════

export const metricsPoller = onRequest(async (_req, res) => {
  logger.info('Running metrics poller');
  const today = new Date().toISOString().split('T')[0];
  const workspaces = await db.collection('workspaces')
    .where('status', 'in', ['trial', 'active']).get();
  let snapshots = 0;

  for (const ws of workspaces.docs) {
    const connections = await db.collection('workspaces').doc(ws.id)
      .collection('social_connections').where('status', '==', 'active').limit(1).get();
    if (connections.empty) continue;

    const snapshotRef = db.collection('workspaces').doc(ws.id)
      .collection('analytics_snapshots').doc(`${today}_all`);
    if ((await snapshotRef.get()).exists) continue;

    await snapshotRef.set({
      id: `${today}_all`, workspaceId: ws.id, platform: 'all', date: today, periodType: 'daily',
      impressions: Math.floor(Math.random() * 5000) + 500,
      reach: Math.floor(Math.random() * 3000) + 300,
      engagement: Math.floor(Math.random() * 500) + 50,
      clicks: Math.floor(Math.random() * 200) + 20,
      shares: Math.floor(Math.random() * 50) + 5,
      saves: Math.floor(Math.random() * 30) + 3,
      videoViews: 0,
      engagementRate: 0.03 + Math.random() * 0.05,
      clickThroughRate: 0.01 + Math.random() * 0.03,
      followerCount: Math.floor(Math.random() * 10000) + 1000,
      followerDelta: Math.floor(Math.random() * 50) - 10,
      audienceGrowthRate: 0.005 + Math.random() * 0.01,
      contentPublishedCount: Math.floor(Math.random() * 5),
      dataSource: 'mock',
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    snapshots++;
  }

  res.json({ success: true, snapshots });
});

// ═══════════════════════════════════════════════════════════
// 4. PUBLISH SCHEDULED — Firestore trigger (always active)
// Fires when a publish job doc is created.
// ═══════════════════════════════════════════════════════════

export const publishScheduled = onDocumentCreated(
  'workspaces/{workspaceId}/publish_jobs/{jobId}',
  async (event) => {
    const data = event.data?.data();
    if (!data || data.status !== 'scheduled') return;

    const scheduledAt = data.scheduledAt?.toDate?.();
    if (!scheduledAt || scheduledAt > new Date()) {
      logger.info(`Publish job ${event.params.jobId} scheduled for future`);
      return;
    }

    const jobRef = db.collection('workspaces').doc(event.params.workspaceId)
      .collection('publish_jobs').doc(event.params.jobId);

    const platforms = data.platforms ?? [];
    await jobRef.update({
      status: 'published',
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      platformResults: platforms.map((p: string) => ({
        platform: p, status: 'published',
        platformPostId: `mock_${p}_${Date.now()}`,
        platformPostUrl: `https://${p}.com/mock-post/${Date.now()}`,
        publishedAt: new Date().toISOString(),
        retryCount: 0, maxRetries: 3,
      })),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Published job ${event.params.jobId} to ${platforms.length} platforms (mock)`);
  },
);

// ═══════════════════════════════════════════════════════════
// 5. APPROVAL ESCALATION — manually callable until go-live
// Go-live schedule: hourly at :30 ('30 * * * *')
// ═══════════════════════════════════════════════════════════

export const approvalEscalation = onRequest(async (_req, res) => {
  logger.info('Running approval escalation check');
  const now = new Date();
  let escalated = 0;
  const workspaces = await db.collection('workspaces').where('status', 'in', ['trial', 'active']).get();

  for (const ws of workspaces.docs) {
    const pending = await db.collection('workspaces').doc(ws.id)
      .collection('approvals').where('status', '==', 'in_review').get();

    for (const approval of pending.docs) {
      const submittedAt = approval.data().submittedAt?.toDate?.();
      if (!submittedAt) continue;
      const hours = (now.getTime() - submittedAt.getTime()) / 3600000;
      if (hours > 48 && approval.data().status !== 'escalated') {
        await approval.ref.update({ status: 'escalated', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        escalated++;
      }
    }
  }

  res.json({ success: true, escalated });
});

// ═══════════════════════════════════════════════════════════
// 6. CALENDAR NOTIFICATIONS — manually callable until go-live
// Go-live schedule: every 15 min ('*/15 * * * *')
// ═══════════════════════════════════════════════════════════

export const calendarNotifications = onRequest(async (_req, res) => {
  logger.info('Running calendar notification check');
  const now = new Date();
  const in15min = new Date(now.getTime() + 15 * 60 * 1000);
  let notified = 0;
  const workspaces = await db.collection('workspaces').where('status', 'in', ['trial', 'active']).get();

  for (const ws of workspaces.docs) {
    const upcoming = await db.collection('workspaces').doc(ws.id)
      .collection('calendar_events')
      .where('status', '==', 'scheduled')
      .where('startAt', '>=', admin.firestore.Timestamp.fromDate(now))
      .where('startAt', '<=', admin.firestore.Timestamp.fromDate(in15min)).get();
    notified += upcoming.size;
  }

  res.json({ success: true, notified });
});

// ═══════════════════════════════════════════════════════════
// 7. RANKING TRACKER — manually callable until go-live
// Go-live schedule: weekly Monday 3am UTC ('0 3 * * 1')
// ═══════════════════════════════════════════════════════════

export const rankingTracker = onRequest(async (_req, res) => {
  logger.info('Running ranking tracker');
  let tracked = 0;
  const workspaces = await db.collection('workspaces').where('status', 'in', ['trial', 'active']).get();

  for (const ws of workspaces.docs) {
    const reports = await db.collection('workspaces').doc(ws.id)
      .collection('seo_reports').where('type', '==', 'on_page_audit').limit(5).get();
    if (reports.empty) continue;

    const keywords = reports.docs.map((r) => r.data().targetKeyword).filter(Boolean);
    for (const keyword of keywords) {
      await db.collection('workspaces').doc(ws.id).collection('seo_reports').add({
        type: 'ranking_snapshot', workspaceId: ws.id, targetKeyword: keyword,
        rankings: [{ keyword, url: `https://example.com/${(keyword as string).replace(/\s+/g, '-')}`, position: Math.floor(Math.random() * 50) + 1, searchVolume: Math.floor(Math.random() * 10000) + 100, checkedAt: admin.firestore.FieldValue.serverTimestamp() }],
        dataSource: 'mock', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: 'system',
      });
      tracked++;
    }
  }

  res.json({ success: true, tracked });
});

// ═══════════════════════════════════════════════════════════
// 8. CONTENT DECAY MONITOR — manually callable until go-live
// Go-live schedule: weekly Wednesday 3am UTC ('0 3 * * 3')
// ═══════════════════════════════════════════════════════════

export const contentDecayMonitor = onRequest(async (_req, res) => {
  logger.info('Running content decay monitor');
  let decayDetected = 0;
  const workspaces = await db.collection('workspaces').where('status', 'in', ['trial', 'active']).get();

  for (const ws of workspaces.docs) {
    const snapshots = await db.collection('workspaces').doc(ws.id)
      .collection('seo_reports').where('type', '==', 'ranking_snapshot')
      .orderBy('createdAt', 'desc').limit(10).get();
    if (snapshots.size < 2) continue;

    const latest = (snapshots.docs[0].data().rankings ?? []) as { keyword: string; position: number }[];
    const previous = (snapshots.docs[1].data().rankings ?? []) as { keyword: string; position: number }[];

    for (const lr of latest) {
      const pr = previous.find((p) => p.keyword === lr.keyword);
      if (pr && lr.position - pr.position > 10) decayDetected++;
    }
  }

  res.json({ success: true, decayDetected });
});
