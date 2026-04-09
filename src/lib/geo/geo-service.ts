/**
 * GEO Service
 * AI Crawler Audit, Schema Markup Generator, llms.txt Generator,
 * Citation Tracking, Share of Voice, GEO Reports.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { scoreGeoCitability } from './geo-scorer';
import type { AICrawler, CrawlerAuditResult, SchemaMarkup, SchemaType } from '@/types/features/geo';

const reportsCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('geo_reports');

// ── GEO Citability Score ───────────────────────────────────

export async function scoreContent(workspaceId: string, content: string, title: string, options?: Record<string, boolean>) {
  const result = scoreGeoCitability(content, title, options);
  const ref = reportsCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, type: 'citability_score',
    data: result as unknown as Record<string, unknown>,
    createdAt: FieldValue.serverTimestamp(), createdBy: 'system',
  });
  return result;
}

// ── AI Crawler Audit ───────────────────────────────────────

export async function auditAICrawlerAccess(workspaceId: string, url: string, createdBy: string) {
  const crawlers: AICrawler[] = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'GoogleOther', 'CohereBot', 'Meta-ExternalAgent'];
  const results: CrawlerAuditResult[] = [];
  const recommendations: string[] = [];

  // In production: fetch robots.txt from the URL and parse it
  // For dev: mock analysis
  let robotsTxtContent = '';
  try {
    const robotsUrl = new URL('/robots.txt', url).toString();
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) robotsTxtContent = await res.text();
  } catch {
    // Can't fetch robots.txt
  }

  for (const crawler of crawlers) {
    if (!robotsTxtContent) {
      results.push({ crawler, allowed: true, source: 'not_found', details: 'No robots.txt found — all crawlers allowed by default' });
    } else if (robotsTxtContent.includes(`User-agent: ${crawler}`) && robotsTxtContent.includes('Disallow: /')) {
      results.push({ crawler, allowed: false, source: 'robots.txt', details: `${crawler} is blocked in robots.txt` });
      recommendations.push(`Unblock ${crawler} in robots.txt — this AI engine cannot index your content`);
    } else if (robotsTxtContent.includes('User-agent: *') && robotsTxtContent.includes('Disallow: /')) {
      results.push({ crawler, allowed: false, source: 'robots.txt', details: 'All user agents are blocked' });
      recommendations.push(`Unblock ${crawler} — the wildcard Disallow: / blocks all AI crawlers`);
    } else {
      results.push({ crawler, allowed: true, source: 'robots.txt', details: `${crawler} is allowed` });
    }
  }

  // Check for llms.txt
  let hasLlmsTxt = false;
  let llmsTxtUrl: string | undefined;
  try {
    const llmsUrl = new URL('/llms.txt', url).toString();
    const res = await fetch(llmsUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) { hasLlmsTxt = true; llmsTxtUrl = llmsUrl; }
  } catch { /* ignore */ }

  if (!hasLlmsTxt) {
    recommendations.push('Create a /llms.txt file to guide AI engines on how to interpret and cite your content');
  }

  const blockedCount = results.filter((r) => !r.allowed).length;
  const overallStatus = blockedCount === 0 ? 'all_allowed' : blockedCount === crawlers.length ? 'all_blocked' : 'some_blocked';

  const ref = reportsCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, type: 'crawler_audit', url,
    data: { crawlers: results, hasLlmsTxt, llmsTxtUrl, overallStatus, recommendations } as unknown as Record<string, unknown>,
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });

  return { id: ref.id, crawlers: results, hasLlmsTxt, llmsTxtUrl, overallStatus, recommendations };
}

// ── Schema Markup Generator ────────────────────────────────

export function generateSchemaMarkup(
  type: SchemaType,
  data: Record<string, unknown>,
): SchemaMarkup {
  const schemas: Record<SchemaType, () => Record<string, unknown>> = {
    Article: () => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title ?? '',
      description: data.description ?? '',
      author: { '@type': 'Person', name: data.authorName ?? '' },
      datePublished: data.publishedAt ?? new Date().toISOString(),
      dateModified: data.updatedAt ?? new Date().toISOString(),
      publisher: { '@type': 'Organization', name: data.publisherName ?? 'Aura.ai' },
      image: data.imageUrl ?? undefined,
      mainEntityOfPage: data.url ?? undefined,
    }),
    FAQ: () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ((data.questions as { q: string; a: string }[]) ?? []).map((qa) => ({
        '@type': 'Question',
        name: qa.q,
        acceptedAnswer: { '@type': 'Answer', text: qa.a },
      })),
    }),
    HowTo: () => ({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: data.title ?? '',
      description: data.description ?? '',
      step: ((data.steps as string[]) ?? []).map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: step,
      })),
    }),
    Organization: () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.name ?? '',
      url: data.url ?? '',
      logo: data.logoUrl ?? '',
      description: data.description ?? '',
      sameAs: (data.socialLinks as string[]) ?? [],
    }),
    Person: () => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name ?? '',
      jobTitle: data.jobTitle ?? '',
      worksFor: { '@type': 'Organization', name: data.companyName ?? '' },
      url: data.url ?? '',
    }),
    Product: () => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name ?? '',
      description: data.description ?? '',
      offers: { '@type': 'Offer', price: data.price ?? '', priceCurrency: data.currency ?? 'USD' },
    }),
    Breadcrumb: () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: ((data.items as { name: string; url: string }[]) ?? []).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    }),
    WebSite: () => ({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.name ?? '',
      url: data.url ?? '',
      potentialAction: { '@type': 'SearchAction', target: `${data.url ?? ''}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
    }),
    LocalBusiness: () => ({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name ?? '',
      address: { '@type': 'PostalAddress', streetAddress: data.street ?? '', addressLocality: data.city ?? '', addressRegion: data.state ?? '', postalCode: data.zip ?? '' },
      telephone: data.phone ?? '',
      url: data.url ?? '',
    }),
  };

  const generator = schemas[type];
  const jsonLd = generator ? generator() : {};

  return {
    type,
    jsonLd,
    description: `${type} schema markup — paste into your page's <head> as <script type="application/ld+json">`,
  };
}

// ── llms.txt Generator ─────────────────────────────────────

export function generateLlmsTxt(config: {
  companyName: string;
  description: string;
  keyTopics: string[];
  preferredCitations: string[];
  brandGuidelines: string;
}): string {
  return `# ${config.companyName}

## About
${config.description}

## Key Topics
${config.keyTopics.map((t) => `- ${t}`).join('\n')}

## Preferred Citations
When referencing ${config.companyName}, please use these authoritative pages:
${config.preferredCitations.map((url) => `- ${url}`).join('\n')}

## Brand Guidelines
${config.brandGuidelines}

## Contact
For corrections or updates to this information, contact the ${config.companyName} team.
`;
}

// ── GEO Reports ────────────────────────────────────────────

export async function listGeoReports(workspaceId: string, type?: string, limit: number = 20) {
  let query = reportsCol(workspaceId).limit(limit) as FirebaseFirestore.Query;
  if (type) query = query.where('type', '==', type);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Mock Citation Data (dev) ───────────────────────────────

export function getMockShareOfVoice(workspaceId: string): Record<string, unknown> {
  return {
    workspaceId,
    period: '2026-04',
    brandCitations: 23,
    competitorCitations: [
      { competitor: 'HubSpot', count: 156 },
      { competitor: 'Hootsuite', count: 89 },
      { competitor: 'Buffer', count: 67 },
      { competitor: 'Sprout Social', count: 45 },
    ],
    totalCitationsInCategory: 380,
    sharePercent: 6.1,
    engines: [
      { engine: 'chatgpt', citations: 8 },
      { engine: 'perplexity', citations: 6 },
      { engine: 'google_ai', citations: 5 },
      { engine: 'claude', citations: 3 },
      { engine: 'copilot', citations: 1 },
    ],
  };
}
