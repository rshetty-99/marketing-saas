/**
 * AI Content Scoring / Predictive Performance Service
 * Scores content for readability, engagement, SEO, brand alignment.
 * Production: Claude API analysis. Dev: mock scoring.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function scoreContent(
  workspaceId: string,
  contentDraftId: string,
  title: string,
  content: string,
) {
  // Mock scoring — in production, send to Claude for analysis
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  const readabilityScore = Math.min(100, Math.max(20, 100 - (avgWordsPerSentence - 15) * 3));
  const hasHook = /^(how|why|what|top|best|\d+)/i.test(title);
  const hasCTA = /click|sign up|subscribe|learn more|get started|download|try|buy/i.test(content);
  const engagementPrediction = Math.min(100, 40 + (hasHook ? 20 : 0) + (hasCTA ? 15 : 0) + Math.min(25, wordCount / 40));
  const brandAlignmentScore = Math.floor(Math.random() * 20) + 70;
  const seoScore = Math.min(100, 30 + (title.length > 30 && title.length < 70 ? 25 : 0) + (wordCount > 300 ? 25 : 0) + (content.includes('#') ? 10 : 0) + 10);

  const overallScore = Math.round((readabilityScore + engagementPrediction + seoScore + brandAlignmentScore) / 4);
  const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F';

  const suggestions: { category: string; severity: string; message: string; suggestion: string }[] = [];
  if (avgWordsPerSentence > 25) suggestions.push({ category: 'readability', severity: 'warning', message: 'Sentences are too long', suggestion: 'Break long sentences into shorter ones for better readability.' });
  if (!hasHook) suggestions.push({ category: 'hook', severity: 'info', message: 'Weak opening hook', suggestion: 'Start with a question, number, or power word to grab attention.' });
  if (!hasCTA) suggestions.push({ category: 'cta', severity: 'warning', message: 'No call-to-action detected', suggestion: 'Add a clear CTA to drive engagement.' });
  if (wordCount < 200) suggestions.push({ category: 'engagement', severity: 'info', message: 'Content may be too short', suggestion: 'Consider expanding to 300+ words for better engagement.' });

  const score = {
    contentDraftId, workspaceId, overallScore, grade,
    readabilityScore: Math.round(readabilityScore),
    engagementPrediction: Math.round(engagementPrediction),
    seoScore: Math.round(seoScore),
    brandAlignmentScore,
    emotionalTone: 'neutral' as const,
    viralPotential: overallScore >= 85 ? 'high' : overallScore >= 70 ? 'medium' : 'low',
    suggestions,
    benchmarkPercentile: Math.min(99, Math.max(10, overallScore - 5 + Math.floor(Math.random() * 10))),
    predictedReach: Math.floor(overallScore * 50 + Math.random() * 2000),
    predictedEngagementRate: Number((overallScore * 0.05 + Math.random() * 2).toFixed(2)),
  };

  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('content_scores').doc();
  await ref.set({ id: ref.id, ...score, scoredAt: FieldValue.serverTimestamp() });

  return { id: ref.id, ...score };
}

export async function getContentScore(workspaceId: string, contentDraftId: string) {
  const snap = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('content_scores').where('contentDraftId', '==', contentDraftId)
    .orderBy('scoredAt', 'desc').limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}
