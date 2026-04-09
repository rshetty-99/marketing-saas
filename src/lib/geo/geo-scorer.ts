/**
 * GEO Citability Scorer
 * Scores content on how likely AI engines are to cite it.
 * Uses heuristic analysis for fast scoring (no AI call needed).
 */

import type { GeoCitabilityScore, GeoScoreDimension } from '@/types/features/geo';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Score content for AI citability (GEO).
 */
export function scoreGeoCitability(
  content: string,
  title: string,
  options?: { hasSchemaMarkup?: boolean; hasFaqSection?: boolean; hasLastUpdated?: boolean; authorBio?: boolean },
): GeoCitabilityScore {
  const text = stripHtml(content);
  const textLower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);

  // ── 1. Direct Answers (25%) ──────────────────────────────
  const directAnswers = scoreDirectAnswers(content, text, sentences);

  // ── 2. Structured Data (20%) ─────────────────────────────
  const structuredData = scoreStructuredData(content, options);

  // ── 3. Entity Authority (15%) ────────────────────────────
  const entityAuthority = scoreEntityAuthority(content, text, options);

  // ── 4. Content Structure (20%) ───────────────────────────
  const contentStructure = scoreContentStructure(content, text, words);

  // ── 5. Freshness (10%) ───────────────────────────────────
  const freshness = scoreFreshness(content, text, options);

  // ── 6. Citation Readiness (10%) ──────────────────────────
  const citationReadiness = scoreCitationReadiness(text, textLower, words, sentences);

  const dimensions = { directAnswers, structuredData, entityAuthority, contentStructure, freshness, citationReadiness };

  // Weighted overall score
  const overallScore = Math.round(
    Object.values(dimensions).reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  // Collect all recommendations
  const suggestions = Object.values(dimensions)
    .flatMap((d) => d.recommendations)
    .slice(0, 8);

  return { overallScore, dimensions, suggestions };
}

function scoreDirectAnswers(html: string, text: string, sentences: string[]): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 50;

  // Does the first paragraph answer a question directly?
  const firstPara = text.split(/\n\n/)[0] ?? '';
  const firstParaWords = firstPara.split(/\s+/).length;
  if (firstParaWords <= 40 && firstParaWords >= 10) {
    score += 15;
    findings.push('Opening paragraph is concise — good for AI extraction');
  } else if (firstParaWords > 60) {
    recommendations.push('Shorten the opening paragraph to 20-40 words with a direct answer — AI engines extract the first paragraph');
    score -= 10;
  }

  // "What is" / "How to" / definition patterns
  const hasDefinition = /\b(is a|refers to|means|defined as|is the process of)\b/i.test(text);
  if (hasDefinition) { score += 10; findings.push('Contains definition-style language — easily extractable by AI'); }
  else { recommendations.push('Add a clear definition or "what is" statement — AI engines favor concise definitions'); }

  // FAQ-style Q&A pairs
  const hasFaqPattern = /<h[2-4][^>]*>.*\?<\/h[2-4]>/i.test(html) || /^#+\s.*\?$/m.test(text);
  if (hasFaqPattern) { score += 15; findings.push('Contains question-heading patterns — excellent for AI Q&A extraction'); }
  else { recommendations.push('Add FAQ-style headings (questions as H2/H3) — AI engines match these to user queries'); }

  // TL;DR or summary section
  const hasTldr = /tl;?dr|summary|key takeaway|in short|the bottom line/i.test(text);
  if (hasTldr) { score += 10; findings.push('Has TL;DR or summary section'); }
  else { recommendations.push('Add a "Key Takeaways" or "TL;DR" section — AI engines cite these directly'); }

  return { name: 'Direct Answers', score: Math.min(100, Math.max(0, score)), weight: 0.25, findings, recommendations };
}

function scoreStructuredData(html: string, options?: { hasSchemaMarkup?: boolean; hasFaqSection?: boolean }): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 40;

  if (options?.hasSchemaMarkup) { score += 30; findings.push('Schema markup detected'); }
  else { recommendations.push('Add JSON-LD schema markup (Article, FAQ, HowTo) — AI engines use structured data to understand content'); score -= 10; }

  if (options?.hasFaqSection) { score += 15; findings.push('FAQ section present'); }

  // Check for semantic HTML
  const hasSemanticHtml = /<(article|section|aside|nav|header|footer|main)/i.test(html);
  if (hasSemanticHtml) { score += 10; findings.push('Uses semantic HTML elements'); }
  else { recommendations.push('Use semantic HTML (article, section, aside) — helps AI crawlers understand content hierarchy'); }

  // Check for structured lists
  const hasLists = /<[uo]l/i.test(html);
  if (hasLists) { score += 10; findings.push('Contains structured lists'); }
  else { recommendations.push('Add numbered or bullet lists for key points — AI engines extract list items as discrete facts'); }

  return { name: 'Structured Data', score: Math.min(100, Math.max(0, score)), weight: 0.20, findings, recommendations };
}

function scoreEntityAuthority(html: string, text: string, options?: { authorBio?: boolean }): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 45;

  // Author attribution
  if (options?.authorBio) { score += 20; findings.push('Author bio present — builds entity authority'); }
  else { recommendations.push('Add author name and bio — AI engines weight content by author credibility (E-E-A-T)'); }

  // Sources and citations
  const hasCitations = /according to|research shows|study finds|data from|source:|cited/i.test(text);
  if (hasCitations) { score += 15; findings.push('Contains citations and source references'); }
  else { recommendations.push('Add source citations ("According to [study/expert]") — AI engines prefer content that references authoritative sources'); }

  // Statistics and data
  const hasStats = /\d+%|\d+x|\$\d|million|billion|increased by|decreased by|grew by/i.test(text);
  if (hasStats) { score += 15; findings.push('Contains specific statistics — highly citable'); }
  else { recommendations.push('Add specific statistics and data points — AI engines cite exact numbers over vague claims'); }

  // External links to authoritative sources
  const hasExternalLinks = /href="https?:\/\/(?!localhost)/i.test(html);
  if (hasExternalLinks) { score += 5; findings.push('Links to external sources'); }

  return { name: 'Entity Authority', score: Math.min(100, Math.max(0, score)), weight: 0.15, findings, recommendations };
}

function scoreContentStructure(html: string, text: string, words: string[]): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 50;

  // Heading hierarchy
  const h2Count = (html.match(/<h2/gi) ?? []).length;
  const h3Count = (html.match(/<h3/gi) ?? []).length;
  if (h2Count >= 3) { score += 15; findings.push(`${h2Count} H2 headings — good topic segmentation`); }
  else { recommendations.push('Add more H2 headings (aim for 3+) — each heading creates a citable topic passage'); }
  if (h3Count >= 2) { score += 5; }

  // Paragraph length
  const paragraphs = text.split(/\n\n/).filter((p) => p.trim().length > 20);
  const avgParaLength = paragraphs.length > 0 ? words.length / paragraphs.length : words.length;
  if (avgParaLength <= 60) { score += 10; findings.push('Short paragraphs — easy for AI to extract'); }
  else { recommendations.push('Break paragraphs into 2-3 sentences max — AI engines extract shorter passages'); }

  // Table of contents / jump links
  const hasToc = /table of contents|jump to|in this article|in this guide/i.test(text);
  if (hasToc) { score += 10; findings.push('Has table of contents or navigation'); }

  // Content length
  if (words.length >= 1000 && words.length <= 3000) { score += 10; findings.push(`${words.length} words — ideal length for comprehensive AI extraction`); }
  else if (words.length < 500) { recommendations.push('Content is short — aim for 1000-2500 words for comprehensive topic coverage'); }

  return { name: 'Content Structure', score: Math.min(100, Math.max(0, score)), weight: 0.20, findings, recommendations };
}

function scoreFreshness(html: string, text: string, options?: { hasLastUpdated?: boolean }): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 50;

  // Last updated date
  if (options?.hasLastUpdated) { score += 20; findings.push('"Last updated" timestamp present'); }
  else { recommendations.push('Add a visible "Last updated" date — AI engines prefer fresh content with known recency'); }

  // Current year reference
  const currentYear = new Date().getFullYear();
  if (text.includes(String(currentYear))) { score += 15; findings.push(`References ${currentYear} — signals freshness`); }
  else if (text.includes(String(currentYear - 1))) { score += 5; }
  else { recommendations.push(`Include "${currentYear}" in the content — AI engines deprioritize undated or old content`); }

  // Recent statistics
  const hasRecentData = /202[5-9]|Q[1-4] 202/i.test(text);
  if (hasRecentData) { score += 15; findings.push('Contains recent data references'); }
  else { recommendations.push('Include recent statistics (2025-2026 data) — AI engines cite the most current sources'); }

  return { name: 'Freshness', score: Math.min(100, Math.max(0, score)), weight: 0.10, findings, recommendations };
}

function scoreCitationReadiness(text: string, textLower: string, words: string[], sentences: string[]): GeoScoreDimension {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 45;

  // Quotable one-liner statements
  const shortSentences = sentences.filter((s) => s.trim().split(/\s+/).length <= 20 && s.trim().split(/\s+/).length >= 8);
  if (shortSentences.length >= 3) { score += 15; findings.push(`${shortSentences.length} concise, quotable statements`); }
  else { recommendations.push('Write more concise, standalone statements (8-20 words) — these become AI citations'); }

  // Unique/original insights (first-person, proprietary data)
  const hasOriginalInsight = /we found|our data shows|our research|we discovered|in our experience|we analyzed/i.test(text);
  if (hasOriginalInsight) { score += 20; findings.push('Contains original/proprietary insights — highly citable'); }
  else { recommendations.push('Add original research or first-hand experience ("We found that...", "Our data shows...") — AI engines cite unique information over regurgitated content'); }

  // Step-by-step instructions
  const hasSteps = /step \d|first,|second,|third,|finally,|^1\.|^2\.|^3\./mi.test(text);
  if (hasSteps) { score += 10; findings.push('Contains step-by-step format — structured for AI extraction'); }

  // Comparison/contrast patterns
  const hasComparison = /vs\.?|versus|compared to|unlike|on the other hand|while.*,/i.test(text);
  if (hasComparison) { score += 10; findings.push('Contains comparison patterns — AI engines use these for "X vs Y" queries'); }

  return { name: 'Citation Readiness', score: Math.min(100, Math.max(0, score)), weight: 0.10, findings, recommendations };
}
