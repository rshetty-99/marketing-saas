/**
 * F8: Brand Voice Service
 *
 * Handles brand profile CRUD, voice consistency scoring,
 * brand kit extraction from URLs, and voice test drive.
 * Reads/writes to entity_profiles/{workspaceId}.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { BrandVoiceProfile, BrandAssets, BrandVoiceScore } from '@/types/features/f0';
import { writeAuditLog } from '@/lib/f7/team-management';

// ─── Get Brand Profile ──────────────────────────────────────────────

export async function getBrandProfile(workspaceId: string): Promise<{
  brandName?: string;
  primaryColor?: string;
  voiceTone?: string;
  brandVoice?: BrandVoiceProfile;
  brandAssets?: BrandAssets;
  contentStrategy?: Record<string, unknown>;
  aiDefaults?: Record<string, unknown>;
} | null> {
  const doc = await adminDb.collection('entity_profiles').doc(workspaceId).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    brandName: data?.brandName,
    primaryColor: data?.primaryColor,
    voiceTone: data?.voiceTone,
    brandVoice: data?.brandVoice,
    brandAssets: data?.brandAssets,
    contentStrategy: data?.contentStrategy,
    aiDefaults: data?.aiDefaults,
  };
}

// ─── Update Brand Profile ───────────────────────────────────────────

export async function updateBrandProfile(
  workspaceId: string,
  updates: Record<string, unknown>,
  updatedBy: string,
): Promise<void> {
  const profileRef = adminDb.collection('entity_profiles').doc(workspaceId);
  const profileSnap = await profileRef.get();

  if (!profileSnap.exists) {
    throw new Error(`Entity profile for workspace ${workspaceId} not found`);
  }

  await profileRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Determine which aspect was updated for audit log
  const action = updates.brandVoice
    ? 'brand.voice_updated'
    : updates.brandAssets
      ? 'brand.assets_updated'
      : 'brand.strategy_updated';

  await writeAuditLog(workspaceId, {
    action,
    resourceType: 'brand',
    resourceId: workspaceId,
    actorId: updatedBy,
    details: { updatedFields: Object.keys(updates) },
  });
}

// ─── Brand Voice Consistency Score ──────────────────────────────────

/**
 * Score content against a brand voice profile.
 * Returns a weighted composite score 0-100 with per-dimension breakdown.
 *
 * Scoring dimensions (defaults):
 *   Vocabulary (0.25) — banned term compliance + approved term usage
 *   Tone (0.25) — formality level + personality trait alignment
 *   Structure (0.15) — sentence length + paragraph patterns
 *   Readability (0.15) — reading level consistency
 *   Identity (0.20) — brand-specific markers (catchphrases, CTA style)
 */
export function scoreBrandVoiceConsistency(
  content: string,
  profile: BrandVoiceProfile,
): BrandVoiceScore {
  const weights = {
    vocabulary: profile.scoringWeights?.vocabulary ?? 0.25,
    tone: profile.scoringWeights?.tone ?? 0.25,
    structure: profile.scoringWeights?.structure ?? 0.15,
    readability: profile.scoringWeights?.readability ?? 0.15,
    identity: profile.scoringWeights?.identity ?? 0.20,
  };

  const contentLower = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = content.split(/\s+/).filter((w) => w.length > 0);

  // ── Vocabulary score ──
  const flaggedTerms: { term: string; reason: string; replacement?: string }[] = [];
  let vocabScore = 100;

  // Check banned terms
  for (const banned of profile.bannedTerms ?? []) {
    if (contentLower.includes(banned.term.toLowerCase())) {
      vocabScore -= 15;
      flaggedTerms.push({
        term: banned.term,
        reason: `Banned term: ${banned.reason ?? 'not on-brand'}`,
        replacement: banned.replacement,
      });
    }
  }

  // Check caution terms without context
  for (const caution of profile.cautionTerms ?? []) {
    if (contentLower.includes(caution.term.toLowerCase())) {
      vocabScore -= 5;
      flaggedTerms.push({
        term: caution.term,
        reason: `Use carefully: ${caution.context ?? 'check context'}`,
      });
    }
  }

  // Bonus for approved terms used
  let approvedUsed = 0;
  for (const approved of profile.approvedTerms ?? []) {
    if (contentLower.includes(approved.term.toLowerCase())) {
      approvedUsed++;
    }
  }
  if ((profile.approvedTerms?.length ?? 0) > 0) {
    const approvalRate = approvedUsed / (profile.approvedTerms?.length ?? 1);
    vocabScore = Math.min(100, vocabScore + Math.round(approvalRate * 20));
  }
  vocabScore = Math.max(0, Math.min(100, vocabScore));

  // ── Tone score ──
  let toneScore = 70; // Base
  if (profile.formalityLevel) {
    // Simple heuristic: contractions = informal, longer sentences = formal
    const contractionCount = (content.match(/\b(don't|can't|won't|isn't|aren't|it's|I'm|you're|we're|they're)\b/gi) ?? []).length;
    const contractionRate = contractionCount / Math.max(words.length, 1);
    const estimatedFormality = contractionRate > 0.02 ? 3 : contractionRate > 0.01 ? 5 : 7;
    const formalityDiff = Math.abs(estimatedFormality - profile.formalityLevel);
    toneScore = Math.max(0, 100 - formalityDiff * 12);
  }

  // ── Structure score ──
  let structureScore = 80;
  if (profile.maxSentenceLength && sentences.length > 0) {
    const avgLength = words.length / sentences.length;
    if (avgLength > profile.maxSentenceLength) {
      structureScore -= Math.min(40, Math.round((avgLength - profile.maxSentenceLength) * 5));
    }
  }
  structureScore = Math.max(0, Math.min(100, structureScore));

  // ── Readability score ──
  let readabilityScore = 75;
  if (profile.targetReadingLevel) {
    // Simple approximation: avg word length correlates with reading level
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);
    // grade-8 ≈ avg word length 4.5-5.5
    if (avgWordLength > 6) readabilityScore -= 20;
    if (avgWordLength < 3.5) readabilityScore -= 10;
  }
  readabilityScore = Math.max(0, Math.min(100, readabilityScore));

  // ── Identity score ──
  let identityScore = 70;
  // Check for personality trait markers
  if (profile.personalityTraits && profile.personalityTraits.length > 0) {
    identityScore = 75; // Has defined traits = better baseline
  }
  // Check emoji policy compliance
  if (profile.emojiPolicy) {
    const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(content);
    if (profile.emojiPolicy === 'banned' && hasEmoji) identityScore -= 20;
    if (profile.emojiPolicy === 'encouraged' && !hasEmoji) identityScore -= 10;
  }
  identityScore = Math.max(0, Math.min(100, identityScore));

  // ── Weighted composite ──
  const overallScore = Math.round(
    vocabScore * weights.vocabulary +
    toneScore * weights.tone +
    structureScore * weights.structure +
    readabilityScore * weights.readability +
    identityScore * weights.identity,
  );

  // ── Suggestions ──
  const suggestions: string[] = [];
  if (vocabScore < 70) suggestions.push('Review vocabulary — banned or cautionary terms detected.');
  if (toneScore < 70) suggestions.push('Adjust tone to match the target formality level.');
  if (structureScore < 70) suggestions.push('Shorten sentences to stay within the recommended length.');
  if (readabilityScore < 70) suggestions.push('Simplify language to match the target reading level.');
  if (flaggedTerms.length > 0) suggestions.push(`${flaggedTerms.length} term(s) flagged — check vocabulary rules.`);

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    dimensions: {
      vocabulary: vocabScore,
      tone: toneScore,
      structure: structureScore,
      readability: readabilityScore,
      identity: identityScore,
    },
    suggestions,
    flaggedTerms: flaggedTerms.length > 0 ? flaggedTerms : undefined,
  };
}

// ─── Brand Kit Extraction from URL ──────────────────────────────────

/**
 * Extract brand assets from a website URL.
 * Scrapes the page for: logo, colors, fonts, meta description.
 * Returns partial brand profile data for user review before saving.
 */
export async function extractBrandFromUrl(url: string): Promise<{
  brandName?: string;
  primaryColor?: string;
  colors?: string[];
  logoUrl?: string;
  description?: string;
  fonts?: string[];
}> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AuraBot/1.0 (brand-extraction)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    // Extract brand name from <title> or og:site_name
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogSiteNameMatch = html.match(/property="og:site_name"\s+content="([^"]+)"/i);
    const brandName = ogSiteNameMatch?.[1] || titleMatch?.[1]?.split(/[|\-–—]/)[0]?.trim();

    // Extract colors from inline styles and CSS
    const colorMatches = html.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    const uniqueColors = [...new Set(colorMatches)].slice(0, 10);
    const primaryColor = uniqueColors[0];

    // Extract logo from og:image or common logo patterns
    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    const logoLinkMatch = html.match(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/i);
    let logoUrl = ogImageMatch?.[1] || logoLinkMatch?.[1];
    if (logoUrl && !logoUrl.startsWith('http')) {
      const baseUrl = new URL(url);
      logoUrl = new URL(logoUrl, baseUrl.origin).toString();
    }

    // Extract description from meta
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
      || html.match(/property="og:description"\s+content="([^"]+)"/i);
    const description = descMatch?.[1];

    // Extract fonts from Google Fonts links or font-family declarations
    const googleFontsMatch = html.match(/fonts\.googleapis\.com\/css[^"']+family=([^"'&]+)/gi) ?? [];
    const fonts = googleFontsMatch.map((m) => {
      const familyMatch = m.match(/family=([^"'&]+)/);
      return familyMatch?.[1]?.replace(/\+/g, ' ').split('|')[0]?.split(':')[0] ?? '';
    }).filter(Boolean);

    return {
      brandName: brandName || undefined,
      primaryColor: primaryColor || undefined,
      colors: uniqueColors.length > 0 ? uniqueColors : undefined,
      logoUrl: logoUrl || undefined,
      description: description || undefined,
      fonts: fonts.length > 0 ? fonts : undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Brand extraction failed: ${message}`);
  }
}

// ─── Voice Test Drive ───────────────────────────────────────────────

/**
 * Generate a test paragraph using the configured brand voice.
 * This builds a system prompt from the voice profile and calls the AI.
 * For now, returns a structured prompt that can be used with any LLM.
 */
export function buildVoiceSystemPrompt(profile: BrandVoiceProfile): string {
  const parts: string[] = [];

  parts.push('You are writing content for a brand with the following voice profile:');

  if (profile.personalityTraits?.length) {
    const traits = profile.personalityTraits
      .map((t) => `${t.trait} (intensity: ${t.intensity}/10)`)
      .join(', ');
    parts.push(`Personality: ${traits}`);
  }

  if (profile.formalityLevel) {
    parts.push(`Formality level: ${profile.formalityLevel}/10`);
  }

  if (profile.toneDescriptors?.length) {
    parts.push(`Tone: ${profile.toneDescriptors.join(', ')}`);
  }

  if (profile.antiToneDescriptors?.length) {
    parts.push(`NEVER sound: ${profile.antiToneDescriptors.join(', ')}`);
  }

  if (profile.voiceDescription) {
    parts.push(`Voice description: ${profile.voiceDescription}`);
  }

  if (profile.bannedTerms?.length) {
    const banned = profile.bannedTerms.map((t) => {
      if (t.replacement) return `"${t.term}" → use "${t.replacement}" instead`;
      return `"${t.term}"`;
    });
    parts.push(`NEVER use these terms: ${banned.join('; ')}`);
  }

  if (profile.approvedTerms?.length) {
    const approved = profile.approvedTerms.map((t) => `"${t.term}"`).join(', ');
    parts.push(`Preferred vocabulary: ${approved}`);
  }

  if (profile.maxSentenceLength) {
    parts.push(`Max sentence length: ${profile.maxSentenceLength} words`);
  }

  if (profile.targetReadingLevel) {
    parts.push(`Target reading level: ${profile.targetReadingLevel}`);
  }

  if (profile.emojiPolicy) {
    parts.push(`Emoji policy: ${profile.emojiPolicy}`);
  }

  if (profile.formattingPreferences) {
    const prefs = [];
    if (profile.formattingPreferences.bulletPoints) prefs.push('use bullet points');
    if (profile.formattingPreferences.shortParagraphs) prefs.push('keep paragraphs short');
    if (profile.formattingPreferences.headingStyle) prefs.push(`headings: ${profile.formattingPreferences.headingStyle}`);
    if (prefs.length) parts.push(`Formatting: ${prefs.join(', ')}`);
  }

  if (profile.writingSamples?.length) {
    const approved = profile.writingSamples.filter((s) => s.isApproved);
    if (approved.length > 0) {
      parts.push('Reference writing samples (match this style):');
      for (const sample of approved.slice(0, 3)) {
        parts.push(`"${sample.content.slice(0, 200)}${sample.content.length > 200 ? '...' : ''}"`);
      }
    }
  }

  return parts.join('\n');
}
