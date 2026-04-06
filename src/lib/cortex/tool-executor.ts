/**
 * Cortex Tool Executor — Maps tool names to direct service calls
 * Phase 11A: Read-only tools only (no HTTP overhead)
 */

import { listDrafts, getDraft } from '@/lib/f1/content-service';
import { listLeads } from '@/lib/f12/lead-service';
import { listClients, getMockHealthScore } from '@/lib/f14/client-service';
import { mockKeywordResearch } from '@/lib/f10/seo-service';
import { listMentions } from '@/lib/listening/listening-service';
import { adminDb } from '@/lib/firebase/admin';

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  workspaceId: string,
): Promise<{ result: Record<string, unknown>; durationMs: number }> {
  const start = Date.now();
  let result: Record<string, unknown>;

  switch (toolName) {
    case 'analytics_overview': {
      // Mock analytics for dev — real analytics in production
      result = {
        period: (args.dateRange as string) ?? 'last_30_days',
        totalReach: 45200, reachChange: 12,
        totalEngagement: 3420, engagementChange: 8,
        totalFollowers: 12800, followerChange: 3,
        totalPosts: 34, postsChange: -5,
        topPlatform: 'instagram',
        topPost: { title: 'AI Marketing Tips', engagement: 342 },
      };
      break;
    }
    case 'analytics_compare': {
      result = {
        current: { reach: 45200, engagement: 3420, followers: 12800 },
        previous: { reach: 40300, engagement: 3100, followers: 12400 },
        changes: { reach: '+12.1%', engagement: '+10.3%', followers: '+3.2%' },
      };
      break;
    }
    case 'analytics_compare_clients': {
      const clients = await listClients(workspaceId, 50);
      const metric = (args.metric as string) ?? 'engagement';
      result = {
        metric,
        clients: (clients as Record<string, unknown>[]).slice(0, 10).map((c, i) => ({
          clientId: c.id, name: c.name ?? c.businessName ?? `Client ${i + 1}`,
          value: 1000 + i * 500,     // Deterministic mock values
          change: i % 3 === 0 ? '+12.5%' : i % 3 === 1 ? '+5.2%' : '-3.1%',
        })),
      };
      break;
    }
    case 'content_list': {
      const drafts = await listDrafts(workspaceId, {
        status: args.status as string | undefined,
        limit: (args.limit as number) ?? 20,
      });
      result = {
        drafts: (drafts as Record<string, unknown>[]).map((d) => ({
          id: d.id, title: d.title, status: d.status,
          contentType: d.contentType, channel: d.channel,
          updatedAt: d.updatedAt,
        })),
        total: (drafts as unknown[]).length,
      };
      break;
    }
    case 'content_get': {
      const draft = await getDraft(workspaceId, args.draftId as string);
      result = draft ? (draft as Record<string, unknown>) : { error: 'Draft not found' };
      break;
    }
    case 'calendar_upcoming': {
      // Mock calendar events for dev
      const daysAhead = (args.daysAhead as number) ?? 14;
      result = {
        events: [
          { type: 'publish_schedule', title: 'LinkedIn: AI Marketing Tips', date: new Date(Date.now() + 86400000).toISOString(), platform: 'linkedin' },
          { type: 'publish_schedule', title: 'Instagram: Product Showcase', date: new Date(Date.now() + 172800000).toISOString(), platform: 'instagram' },
          { type: 'content_due', title: 'Blog post: Q3 Strategy', date: new Date(Date.now() + 259200000).toISOString() },
          { type: 'approval_deadline', title: 'Review: Email Campaign', date: new Date(Date.now() + 345600000).toISOString() },
        ].filter(() => daysAhead > 0),
        daysAhead,
      };
      break;
    }
    case 'leads_list': {
      const leads = await listLeads(workspaceId, {
        stage: args.stage as string | undefined,
        assignedTo: args.assignedTo as string | undefined,
        limit: (args.limit as number) ?? 20,
      });
      result = {
        leads: (leads as Record<string, unknown>[]).map((l) => ({
          id: l.id, name: `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || l.email,
          email: l.email, stage: l.stage, score: l.score,
          company: l.company, createdAt: l.createdAt,
        })),
        total: (leads as unknown[]).length,
      };
      break;
    }
    case 'leads_get': {
      if (args.leadId) {
        const doc = await adminDb.collection('workspaces').doc(workspaceId)
          .collection('leads').doc(args.leadId as string).get();
        result = doc.exists ? { id: doc.id, ...doc.data() } as Record<string, unknown> : { error: 'Lead not found' };
      } else if (args.searchName) {
        const leads = await listLeads(workspaceId, { limit: 100 });
        const name = (args.searchName as string).toLowerCase();
        const match = (leads as Record<string, unknown>[]).find((l) =>
          (`${l.firstName ?? ''} ${l.lastName ?? ''}`).toLowerCase().includes(name),
        );
        result = match ?? { error: `No lead found matching "${args.searchName}"` };
      } else {
        result = { error: 'Provide leadId or searchName' };
      }
      break;
    }
    case 'clients_list': {
      const clients = await listClients(workspaceId, (args.limit as number) ?? 50);
      result = {
        clients: (clients as Record<string, unknown>[]).map((c) => ({
          id: c.id, name: c.name ?? c.businessName, industry: c.industry,
          status: c.status, contactEmail: c.contactEmail,
        })),
        total: (clients as unknown[]).length,
      };
      break;
    }
    case 'clients_health': {
      if (args.clientId) {
        const health = await getMockHealthScore(args.clientId as string);
        result = health as unknown as Record<string, unknown>;
      } else {
        const clients = await listClients(workspaceId, 20);
        const scores = await Promise.all(
          (clients as Record<string, unknown>[]).map(async (c) => ({
            clientId: c.id, name: c.name ?? c.businessName,
            ...(await getMockHealthScore(c.id as string) as unknown as Record<string, unknown>),
          })),
        );
        result = { clients: scores };
      }
      break;
    }
    case 'seo_keywords': {
      const keywords = (args.keywords as string[]) ?? [];
      const data = mockKeywordResearch(keywords);
      result = { keywords: data };
      break;
    }
    case 'hashtags_trending': {
      // Mock hashtag analytics
      const hashtags = (args.hashtags as string[]) ?? [];
      const industry = args.industry as string | undefined;
      const mockTags = (industry ? [`#${industry}`, `#${industry}Life`, `#${industry}Tips`] : hashtags).map((tag, i) => ({
        hashtag: tag,
        postCount: 500000 + i * 250000,   // Deterministic mock values
        trend: i % 2 === 0 ? 'up' : 'stable',
        trendPercent: `+${10 + i * 5}%`,
        avgEngagement: 200 + i * 100,
      }));
      result = { hashtags: mockTags, industry };
      break;
    }
    case 'listening_mentions': {
      const mentions = await listMentions(workspaceId, (args.limit as number) ?? 20);
      result = {
        mentions: (mentions as Record<string, unknown>[]).map((m) => ({
          id: m.id, platform: m.platform,
          content: m.content ?? m.textSnippet,
          author: m.author ?? m.authorName,
          sentiment: m.sentiment, status: m.status,
        })),
        total: (mentions as unknown[]).length,
      };
      break;
    }
    case 'workspace_info': {
      const wsDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
      const ws = wsDoc.data() ?? {};
      const membersSnap = await adminDb.collection('workspaces').doc(workspaceId)
        .collection('members').get();
      result = {
        name: ws.name, accountType: ws.accountType, tier: ws.tier,
        status: ws.status, industry: ws.industry,
        teamSize: membersSnap.size, primaryEmail: ws.primaryEmail,
        onboardingCompleted: ws.onboardingCompleted,
      };
      break;
    }
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }

  return { result, durationMs: Date.now() - start };
}
