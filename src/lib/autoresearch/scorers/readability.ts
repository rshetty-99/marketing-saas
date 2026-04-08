/**
 * Readability Scorer — Flesch-Kincaid inspired scoring
 * Measures sentence length, word complexity, paragraph structure.
 */

import type { ScoreResult, ScorerContext } from '../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  let count = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)?.length ?? 1;
  if (count === 0) count = 1;
  return count;
}

export async function scoreReadability(content: string, context: ScorerContext): Promise<ScoreResult> {
  const text = stripHtml(content);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  const words = text.split(/\s+/).filter(Boolean);
  const paragraphs = content.split(/\n\n|\<\/p\>/g).filter((p) => p.trim().length > 20);

  if (words.length < 10) {
    return { name: 'readability', score: 50, weight: 1, feedback: ['Content is too short to score readability'] };
  }

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 20;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Flesch Reading Ease (0-100, higher = easier)
  const fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  const normalizedFlesch = Math.min(100, Math.max(0, fleschScore));

  // Grade level (lower = simpler = better for marketing)
  const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

  const feedback: string[] = [];
  let score = normalizedFlesch;

  // Penalize long sentences
  if (avgSentenceLength > 25) {
    feedback.push(`Average sentence length is ${Math.round(avgSentenceLength)} words — aim for 15-20 for better readability`);
    score -= 10;
  }

  // Penalize complex words
  if (avgSyllablesPerWord > 1.8) {
    feedback.push('Use simpler words — too many multi-syllable words reduce readability');
    score -= 5;
  }

  // Reward good paragraph structure
  if (paragraphs.length < 3 && words.length > 100) {
    feedback.push('Break content into more paragraphs — large blocks of text are hard to scan');
    score -= 10;
  }

  // Check for subheadings in longer content
  const hasSubheadings = /<h[2-4]/i.test(content);
  if (words.length > 200 && !hasSubheadings) {
    feedback.push('Add subheadings (H2/H3) to break up long content — improves scannability');
    score -= 10;
  }

  // Check for bullet/numbered lists
  const hasLists = /<[uo]l/i.test(content);
  if (words.length > 300 && !hasLists) {
    feedback.push('Consider adding bullet points or numbered lists for key takeaways');
    score -= 5;
  }

  // Target grade level for marketing: 6-8
  if (gradeLevel > 12) {
    feedback.push(`Reading level is grade ${Math.round(gradeLevel)} — simplify to grade 8 or lower for broader audience`);
    score -= 10;
  } else if (gradeLevel <= 8) {
    // Bonus for accessible content
    score = Math.min(100, score + 5);
  }

  return {
    name: 'readability',
    score: Math.min(100, Math.max(0, Math.round(score))),
    weight: 1,
    feedback,
    details: {
      fleschScore: Math.round(normalizedFlesch),
      gradeLevel: Math.round(gradeLevel * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
    },
  };
}
