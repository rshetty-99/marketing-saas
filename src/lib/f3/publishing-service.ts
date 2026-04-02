/**
 * F3: Publishing Service
 *
 * Handles publish job creation, scheduling, mock/manual publishing,
 * and per-platform result tracking.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { Channel, PublishMode } from '@/types/features/content';

export async function createPublishJob(
  workspaceId: string,
  data: {
    contentDraftId: string;
    platforms: Channel[];
    scheduledAt?: string;
    publishMode?: PublishMode;
    utmConfig?: Record<string, unknown>;
    firstComment?: string;
  },
  createdBy: string,
): Promise<string> {
  // Verify draft exists and is approved
  const draftRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(data.contentDraftId);

  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) throw new Error('Draft not found');

  const draft = draftSnap.data();
  if (draft?.status !== 'approved') {
    throw new Error(`Draft must be approved before publishing. Current status: ${draft?.status}`);
  }

  const publishMode = data.publishMode ?? 'mock';
  const isScheduled = !!data.scheduledAt;

  // Build platform results (one per platform)
  const platformResults = data.platforms.map((platform) => ({
    platform,
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    firstComment: data.firstComment ?? null,
  }));

  // Create publish job
  const jobRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('publish_jobs')
    .doc();

  const wsDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
  const timezone = wsDoc.data()?.timezone ?? 'UTC';

  await jobRef.set({
    id: jobRef.id,
    workspaceId,
    contentDraftId: data.contentDraftId,
    status: isScheduled ? 'scheduled' : 'publishing',
    publishMode,
    platforms: data.platforms,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    timezone,
    optimalTimeUsed: false,
    platformResults,
    utmConfig: data.utmConfig ?? null,
    contentSnapshot: {
      title: draft?.title ?? '',
      content: draft?.content ?? '',
      contentType: draft?.contentType ?? '',
      channel: draft?.channel ?? null,
      mediaAttachments: draft?.mediaAttachments ?? [],
      platformData: draft?.platformData ?? null,
    },
    clientId: draft?.clientId ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy,
  });

  // Update draft with publish job link
  await draftRef.update({
    status: isScheduled ? 'scheduled' : 'published',
    linkedPublishJobId: jobRef.id,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Mock publish (simulate immediate success)
  if (!isScheduled && publishMode === 'mock') {
    await simulateMockPublish(workspaceId, jobRef.id, data.platforms);
  }

  await writeAuditLog(workspaceId, {
    action: 'content.published',
    resourceType: 'content',
    resourceId: data.contentDraftId,
    actorId: createdBy,
    details: { publishJobId: jobRef.id, platforms: data.platforms, mode: publishMode },
  });

  return jobRef.id;
}

async function simulateMockPublish(
  workspaceId: string,
  jobId: string,
  platforms: Channel[],
): Promise<void> {
  const jobRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('publish_jobs')
    .doc(jobId);

  const platformResults = platforms.map((platform) => ({
    platform,
    status: 'published',
    platformPostId: `mock_${platform}_${Date.now()}`,
    platformPostUrl: `https://${platform}.com/mock-post/${Date.now()}`,
    publishedAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
    metrics: {
      impressions: 0,
      reach: 0,
      clicks: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    },
  }));

  await jobRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    platformResults,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markManuallyPublished(
  workspaceId: string,
  jobId: string,
  platformUrls: Record<string, string>,
  markedBy: string,
  notes?: string,
): Promise<void> {
  const jobRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('publish_jobs')
    .doc(jobId);

  await jobRef.update({
    status: 'published',
    publishMode: 'manual',
    publishedAt: FieldValue.serverTimestamp(),
    manualPublishData: {
      markedPublishedBy: markedBy,
      markedPublishedAt: new Date().toISOString(),
      platformUrls,
      notes: notes ?? null,
    },
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function listPublishJobs(
  workspaceId: string,
  filters: { status?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('publish_jobs')
    .orderBy('createdAt', 'desc')
    .limit(filters.limit ?? 50) as FirebaseFirestore.Query;

  if (filters.status) query = query.where('status', '==', filters.status);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
