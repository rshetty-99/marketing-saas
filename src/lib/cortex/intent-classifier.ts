/**
 * Cortex Intent Classifier — Two-Pass Routing (Pass 1)
 * Fast Sonnet call to classify intent + determine required context blocks.
 * Cost: ~$0.0003 per classification. Latency: ~100-200ms.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { IntentClassification, ContextBlockType } from '@/types/features/cortex';

const CLASSIFICATION_PROMPT = `You are an intent classifier for a marketing platform AI assistant called Cortex.
Given a user message, classify it into exactly one category and list the context blocks needed.

Categories:
- analytics: performance data, metrics, KPIs, how things are going, comparisons
- content: drafts, blog posts, articles, social posts, content creation or listing
- calendar: upcoming events, schedules, deadlines, what's planned
- leads: CRM pipeline, lead management, new leads, lead details
- clients: agency client management, client list, health scores, switching clients
- seo: keyword research, SEO scoring, search optimization
- hashtags: hashtag research, trending tags, hashtag management
- listening: brand mentions, sentiment, social listening, what people are saying
- workspace: team info, settings, subscription, account details
- meta: help, what can you do, getting started, general questions about Cortex

Context blocks (only list what's NEEDED for the response):
- brand_voice: content creation, repurposing, email writing
- recent_content: content questions, publishing, repurpose
- analytics_trends: analytics, reporting, performance questions
- calendar_upcoming: scheduling, calendar, upcoming events
- team_members: assignment, team, who does what
- active_campaigns: campaign status, email, ads questions

Respond in JSON only. Example:
{"category":"analytics","confidence":0.95,"requiredContextBlocks":["analytics_trends"],"suggestedTools":["analytics_overview"]}`;

export async function classifyIntent(
  userMessage: string,
  anthropic: Anthropic,
): Promise<IntentClassification> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: CLASSIFICATION_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category ?? 'meta',
        confidence: parsed.confidence ?? 0.5,
        requiredContextBlocks: (parsed.requiredContextBlocks ?? []) as ContextBlockType[],
        suggestedTools: parsed.suggestedTools ?? [],
      };
    }
  } catch {
    // Fallback on classification failure
  }

  return {
    category: 'meta',
    confidence: 0.3,
    requiredContextBlocks: [],
    suggestedTools: [],
  };
}
