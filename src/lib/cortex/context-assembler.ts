/**
 * Cortex Context Assembler — Two-Pass Routing (Pass 2)
 * Loads targeted context blocks based on classified intent.
 * Enforces 50K token budget.
 */

import { adminDb } from '@/lib/firebase/admin';
import type { IntentClassification, ContextBlock, ContextBlockType } from '@/types/features/cortex';

const TOKEN_BUDGET = 50_000;

async function loadBaseContext(
  workspaceId: string,
  userId: string,
  clientId?: string,
): Promise<ContextBlock> {
  const wsDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
  const ws = wsDoc.data() ?? {};

  let clientInfo = '';
  if (clientId) {
    const clientDoc = await adminDb.collection('clients').doc(clientId).get();
    if (clientDoc.exists) {
      const c = clientDoc.data()!;
      // Client isolation: verify this client belongs to the workspace
      if (c.agencyWorkspaceId === workspaceId) {
        clientInfo = `\nActive Client: "${c.name ?? c.businessName}" (ID: ${clientId}, Industry: ${c.industry ?? 'N/A'})`;
      }
    }
  }

  const content = `[WORKSPACE]
Name: "${ws.name}" | Type: ${ws.accountType} | Tier: ${ws.tier} | Status: ${ws.status}${clientInfo}
User ID: ${userId}`;

  return { type: 'workspace_basics', content, tokenEstimate: 200, loadedAt: Date.now() };
}

async function loadContextBlock(
  type: ContextBlockType,
  workspaceId: string,
  clientId?: string,
): Promise<ContextBlock | null> {
  switch (type) {
    case 'brand_voice': {
      const doc = await adminDb.collection('entity_profiles').doc(workspaceId).get();
      if (!doc.exists) return null;
      const d = doc.data()!;
      const content = `[BRAND VOICE]\nTone: ${d.brandVoice?.tone ?? 'professional'}\nPersonality: ${d.brandVoice?.personality ?? 'N/A'}\nTarget Audience: ${d.brandVoice?.targetAudience ?? 'N/A'}`;
      return { type, content, tokenEstimate: 500, loadedAt: Date.now() };
    }
    case 'recent_content': {
      const snap = await adminDb.collection('workspaces').doc(workspaceId)
        .collection('content_drafts').orderBy('updatedAt', 'desc').limit(10).get();
      const items = snap.docs.map((d) => {
        const data = d.data();
        return `- "${data.title}" (${data.status}, ${data.contentType ?? 'post'})`;
      }).join('\n');
      return { type, content: `[RECENT CONTENT]\n${items || 'No content yet.'}`, tokenEstimate: 1500, loadedAt: Date.now() };
    }
    case 'analytics_trends': {
      // Summarized analytics for context (mock for dev)
      return {
        type, tokenEstimate: 1500, loadedAt: Date.now(),
        content: `[ANALYTICS TRENDS - Last 30 Days]\nTotal Reach: 45.2K (+12%)\nEngagement Rate: 3.8% (+8%)\nFollower Growth: +400 (+3.2%)\nTop Platform: Instagram\nBest Post: "AI Marketing Tips" (342 engagements)`,
      };
    }
    case 'calendar_upcoming': {
      return {
        type, tokenEstimate: 800, loadedAt: Date.now(),
        content: `[UPCOMING CALENDAR]\n- Tomorrow: LinkedIn post "AI Tips" (scheduled 9am)\n- In 3 days: Blog post deadline "Q3 Strategy"\n- In 5 days: Email campaign review deadline`,
      };
    }
    case 'team_members': {
      const snap = await adminDb.collection('workspaces').doc(workspaceId)
        .collection('members').limit(20).get();
      const members = snap.docs.map((d) => {
        const data = d.data();
        return `- ${data.displayName ?? data.email} (${data.role})`;
      }).join('\n');
      return { type, content: `[TEAM]\n${members || 'No team members.'}`, tokenEstimate: 500, loadedAt: Date.now() };
    }
    case 'active_campaigns': {
      return {
        type, tokenEstimate: 800, loadedAt: Date.now(),
        content: `[ACTIVE CAMPAIGNS]\nNo active ad campaigns running. Email: 1 campaign in draft.`,
      };
    }
    default:
      return null;
  }
}

export async function assembleContext(
  workspaceId: string,
  userId: string,
  clientId: string | undefined,
  intent: IntentClassification,
): Promise<{ systemPrompt: string; blocks: ContextBlock[]; totalTokens: number }> {
  const blocks: ContextBlock[] = [];
  let totalTokens = 0;

  // Always load base context
  const base = await loadBaseContext(workspaceId, userId, clientId);
  blocks.push(base);
  totalTokens += base.tokenEstimate;

  // Load intent-specific blocks
  for (const blockType of intent.requiredContextBlocks) {
    if (totalTokens >= TOKEN_BUDGET) break;
    const block = await loadContextBlock(blockType, workspaceId, clientId);
    if (block) {
      blocks.push(block);
      totalTokens += block.tokenEstimate;
    }
  }

  const contextSection = blocks.map((b) => b.content).join('\n\n');

  const systemPrompt = `You are Cortex, the AI marketing command center for Aura.ai.
You help marketing agencies manage their operations through natural language.
Be helpful, concise, and action-oriented. Format data with bullet points or tables.
Never fabricate data — use the provided tools to fetch real information.
After answering, suggest a helpful next action when appropriate.

${contextSection}`;

  return { systemPrompt, blocks, totalTokens };
}
