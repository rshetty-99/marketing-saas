/**
 * Social Listening Service (DIY)
 * Monitors mentions via free platform APIs + Google Alerts.
 * Optional Brand24 upgrade path when API key is set.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { analyzeSentiment } from '@/lib/sentiment/sentiment-service';

export interface ListeningConfig {
  workspaceId: string;
  keywords: string[];
  platforms: string[];
  alertFrequency: 'realtime' | 'daily' | 'weekly';
  alertEmail?: string;
  brand24ApiKey?: string;              // Optional upgrade path
  isActive: boolean;
}

export async function getListeningConfig(workspaceId: string): Promise<ListeningConfig | null> {
  const doc = await adminDb.collection('workspaces').doc(workspaceId).collection('settings').doc('listening_config').get();
  return doc.exists ? (doc.data() as ListeningConfig) : null;
}

export async function saveListeningConfig(workspaceId: string, config: Partial<ListeningConfig>) {
  await adminDb.collection('workspaces').doc(workspaceId).collection('settings').doc('listening_config').set({
    workspaceId, ...config, updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function listMentions(workspaceId: string, limit: number = 50) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId).collection('listening_feed')
    .orderBy('detectedAt', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Mock mentions for dev
export function generateMockMentions(keywords: string[]): Record<string, unknown>[] {
  const platforms = ['instagram', 'linkedin', 'youtube', 'facebook'];
  const keyword = keywords[0] ?? 'aura';

  return [
    { id: 'm1', platform: 'instagram', content: `Just discovered ${keyword} and it's amazing for our agency!`, author: '@design_agency', sentiment: analyzeSentiment(`Just discovered ${keyword} and it's amazing!`), detectedAt: new Date().toISOString(), status: 'new' },
    { id: 'm2', platform: 'linkedin', content: `Has anyone tried ${keyword} for their marketing workflow? Looking for feedback.`, author: 'Marketing Director at TechCo', sentiment: analyzeSentiment('Has anyone tried this? Looking for feedback.'), detectedAt: new Date(Date.now() - 3600000).toISOString(), status: 'new' },
    { id: 'm3', platform: 'youtube', content: `Full review of ${keyword} — is it worth it for agencies?`, author: 'AgencyReview Channel', sentiment: analyzeSentiment('Full review — is it worth it?'), detectedAt: new Date(Date.now() - 7200000).toISOString(), status: 'actioned' },
    { id: 'm4', platform: 'facebook', content: `We switched from HubSpot to ${keyword} and here's what happened...`, author: 'Digital Marketing Group', sentiment: analyzeSentiment('We switched and here is what happened...'), detectedAt: new Date(Date.now() - 86400000).toISOString(), status: 'new' },
  ];
}
