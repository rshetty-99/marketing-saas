/**
 * Video Editing / Reels Creator Service
 * Video project management, clip composition, overlay text/logos.
 * Production: server-side rendering via FFmpeg Cloud Function.
 * Dev: mock project state management.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('video_projects');

export async function listVideoProjects(workspaceId: string) {
  const snap = await col(workspaceId).orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getVideoProject(workspaceId: string, projectId: string) {
  const doc = await col(workspaceId).doc(projectId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createVideoProject(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = col(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, status: 'editing',
    width: 1080, height: 1920, durationSeconds: 0, fps: 30,
    clips: [], overlays: [], outputFormat: 'mp4',
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return ref.id;
}

export async function updateVideoProject(workspaceId: string, projectId: string, data: Record<string, unknown>) {
  await col(workspaceId).doc(projectId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function renderVideo(workspaceId: string, projectId: string) {
  // In production: trigger Cloud Function with FFmpeg to render the video
  // For dev: simulate rendering with mock output
  const ref = col(workspaceId).doc(projectId);
  await ref.update({
    status: 'rendering',
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Mock: mark as completed after "rendering"
  await ref.update({
    status: 'completed',
    outputUrl: `https://storage.example.com/videos/${projectId}.mp4`,
    thumbnailUrl: `https://storage.example.com/videos/${projectId}_thumb.jpg`,
    outputSizeBytes: 5242880,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
