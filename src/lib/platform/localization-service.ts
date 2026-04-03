/**
 * Multi-Language / Localization Service
 * Content translation workflows, locale management.
 * Production: Claude/DeepL/Google Translate. Dev: mock translations.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const localeCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('content_locales');

export async function getLocaleConfig(workspaceId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('localization').get();
  return doc.exists ? doc.data() : {
    defaultLocale: 'en', enabledLocales: ['en'], autoTranslate: false, translationProvider: 'claude',
  };
}

export async function updateLocaleConfig(workspaceId: string, data: Record<string, unknown>) {
  await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('localization')
    .set({ workspaceId, ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function listLocales(workspaceId: string, contentDraftId: string) {
  const snap = await localeCol(workspaceId)
    .where('contentDraftId', '==', contentDraftId)
    .orderBy('locale', 'asc').limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createLocale(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = localeCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, translationMethod: 'ai', translationStatus: 'pending',
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function translateContent(title: string, content: string, targetLocale: string): Promise<{ title: string; content: string }> {
  // In production: call Claude API or DeepL for real translation
  // For dev: mock prefix translation
  const localeNames: Record<string, string> = { es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', pt: 'Portuguese', it: 'Italian', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi' };
  const lang = localeNames[targetLocale] ?? targetLocale;
  return {
    title: `[${lang}] ${title}`,
    content: `[Translated to ${lang}]\n\n${content}`,
  };
}
