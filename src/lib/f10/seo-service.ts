/**
 * F10: SEO Service
 * On-page scorer (real logic) + keyword research (mock for dev).
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { OnPageSEOScore, SEOSuggestion, KeywordData, ContentBrief } from '@/types/features/seo';

// ─── On-Page SEO Scorer (REAL — runs locally) ───────────────

export function scoreOnPageSEO(
  content: string,
  title: string,
  focusKeyword: string,
  metaTitle?: string,
  metaDescription?: string,
): OnPageSEOScore {
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const contentLower = content.toLowerCase();
  const keywordLower = focusKeyword.toLowerCase();
  const suggestions: SEOSuggestion[] = [];

  // Keyword density
  const keywordCount = contentLower.split(keywordLower).length - 1;
  const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
  const densityScore = density >= 0.5 && density <= 2.5 ? 100 : density < 0.5 ? 40 : 60;
  if (density < 0.5) suggestions.push({ type: 'keyword_density', severity: 'warning', message: `Keyword "${focusKeyword}" appears too few times. Aim for 0.5-2.5% density.`, currentValue: `${density.toFixed(1)}%`, recommendedValue: '1-2%' });

  // Meta title
  const mt = metaTitle ?? title;
  const mtLength = mt.length;
  const mtHasKeyword = mt.toLowerCase().includes(keywordLower);
  const mtScore = (mtLength >= 50 && mtLength <= 60 ? 50 : 25) + (mtHasKeyword ? 50 : 0);
  if (!mtHasKeyword) suggestions.push({ type: 'meta_title', severity: 'critical', message: 'Focus keyword missing from meta title.' });
  if (mtLength > 60) suggestions.push({ type: 'meta_title', severity: 'warning', message: `Meta title too long (${mtLength} chars). Keep under 60.` });

  // Meta description
  const md = metaDescription ?? '';
  const mdLength = md.length;
  const mdHasKeyword = md.toLowerCase().includes(keywordLower);
  const mdScore = mdLength === 0 ? 0 : (mdLength >= 120 && mdLength <= 160 ? 50 : 25) + (mdHasKeyword ? 50 : 0);
  if (mdLength === 0) suggestions.push({ type: 'meta_description', severity: 'critical', message: 'Meta description is missing.' });

  // Heading structure
  const h1Matches = content.match(/^# /gm) ?? [];
  const h2Matches = content.match(/^## /gm) ?? [];
  const h1HasKeyword = h1Matches.some((h) => content.substring(content.indexOf(h)).toLowerCase().includes(keywordLower));
  const headingScore = (h1Matches.length === 1 ? 40 : 20) + (h2Matches.length >= 2 ? 30 : 15) + (h1HasKeyword ? 30 : 0);
  if (h1Matches.length !== 1) suggestions.push({ type: 'heading_structure', severity: 'warning', message: `Found ${h1Matches.length} H1 tags. Use exactly one.` });

  // Readability
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const readabilityScore = avgWordsPerSentence <= 20 ? 100 : avgWordsPerSentence <= 25 ? 70 : 40;
  const gradeLevel = avgWordsPerSentence <= 15 ? 'grade-6' : avgWordsPerSentence <= 20 ? 'grade-8' : 'grade-12';

  // Content length
  const lengthScore = wordCount >= 1500 ? 100 : wordCount >= 800 ? 70 : wordCount >= 300 ? 40 : 10;
  if (wordCount < 300) suggestions.push({ type: 'content_length', severity: 'critical', message: `Content is too short (${wordCount} words). Aim for 1500+.` });

  // Internal links
  const linkCount = (content.match(/\[.*?\]\(.*?\)/g) ?? []).length;
  const linkScore = linkCount >= 3 ? 100 : linkCount >= 1 ? 60 : 20;
  if (linkCount === 0) suggestions.push({ type: 'internal_links', severity: 'warning', message: 'No internal links found. Add 2-3 relevant links.' });

  // Image audit
  const images = content.match(/!\[.*?\]\(.*?\)/g) ?? [];
  const missingAlt = images.filter((img) => img.match(/!\[\s*\]\(/)).length;
  const imageScore = images.length === 0 ? 50 : (images.length > 0 && missingAlt === 0 ? 100 : 60);

  const overallScore = Math.round(
    densityScore * 0.15 + mtScore * 0.15 + mdScore * 0.10 + headingScore * 0.15 +
    readabilityScore * 0.10 + lengthScore * 0.15 + linkScore * 0.10 + imageScore * 0.10,
  );

  return {
    overallScore,
    keywordDensity: { score: densityScore, current: density, recommended: { min: 0.5, max: 2.5 } },
    metaTitle: { score: mtScore, length: mtLength, hasKeyword: mtHasKeyword, recommended: mt },
    metaDescription: { score: mdScore, length: mdLength, hasKeyword: mdHasKeyword },
    headingStructure: { score: headingScore, h1Count: h1Matches.length, h2Count: h2Matches.length, hasKeywordInH1: h1HasKeyword },
    readability: { score: readabilityScore, gradeLevel, sentenceCount: sentences.length, avgWordsPerSentence },
    contentLength: { score: lengthScore, wordCount, recommended: 1500 },
    internalLinks: { score: linkScore, count: linkCount, recommended: 3 },
    imageAudit: { score: imageScore, totalImages: images.length, missingAlt, oversized: 0 },
    suggestions,
  };
}

// ─── Keyword Research (MOCK for dev) ────────────────────────

export function mockKeywordResearch(keywords: string[]): KeywordData[] {
  return keywords.map((keyword) => ({
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 100,
    difficulty: Math.floor(Math.random() * 100),
    cpc: Math.floor(Math.random() * 500) + 10,
    intent: (['informational', 'transactional', 'commercial', 'navigational'] as const)[Math.floor(Math.random() * 4)],
    serpFeatures: (['people_also_ask', 'featured_snippet'] as const).slice(0, Math.floor(Math.random() * 3)) as KeywordData['serpFeatures'],
    trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10000) + 500),
    relatedKeywords: [`${keyword} guide`, `best ${keyword}`, `${keyword} tips`],
  }));
}

// ─── Content Brief (MOCK for dev) ───────────────────────────

export function mockContentBrief(keyword: string): ContentBrief {
  return {
    targetKeyword: keyword,
    targetWordCount: { min: 1200, max: 2500, recommended: 1800 },
    targetHeadingCount: 8,
    targetImageCount: 4,
    suggestedHeadings: [
      { tag: 'h2', text: `What is ${keyword}?` },
      { tag: 'h2', text: `Why ${keyword} matters` },
      { tag: 'h2', text: `How to get started with ${keyword}` },
      { tag: 'h3', text: 'Step 1: Research' },
      { tag: 'h3', text: 'Step 2: Implementation' },
      { tag: 'h2', text: `${keyword} best practices` },
      { tag: 'h2', text: 'Common mistakes to avoid' },
      { tag: 'h2', text: 'Conclusion' },
    ],
    questionsToAnswer: [
      `What is ${keyword}?`,
      `How does ${keyword} work?`,
      `Why is ${keyword} important?`,
      `What are the benefits of ${keyword}?`,
    ],
    nlpTerms: [
      { term: keyword, importance: 1.0, recommendedCount: 8 },
      { term: 'strategy', importance: 0.7, recommendedCount: 4 },
      { term: 'implementation', importance: 0.5, recommendedCount: 3 },
    ],
    relatedKeywords: [
      { keyword: `${keyword} tools`, volume: 2400, relevanceScore: 0.9 },
      { keyword: `${keyword} examples`, volume: 1800, relevanceScore: 0.85 },
    ],
    competitorAnalysis: [],
    contentScore: 0,
    readabilityTarget: 'grade-8',
    searchIntent: 'informational',
  };
}

// ─── Save SEO Report ────────────────────────────────────────

export async function saveSEOReport(
  workspaceId: string,
  report: Record<string, unknown>,
  createdBy: string,
): Promise<string> {
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('seo_reports').doc();
  await ref.set({
    id: ref.id,
    workspaceId,
    ...report,
    dataSource: 'mock',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy,
  });
  return ref.id;
}

export async function listSEOReports(
  workspaceId: string,
  limit: number = 50,
): Promise<Record<string, unknown>[]> {
  const snap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('seo_reports')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
