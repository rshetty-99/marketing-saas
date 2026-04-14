/**
 * Cortex Write Tool Executor — Phase 11B
 * Executes write tools through API routes (not direct service calls).
 * This ensures RBAC validation, Zod input checking, and audit logging
 * all happen exactly as they would from the UI.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface WriteToolResult {
  result: Record<string, unknown>;
  durationMs: number;
  requiresConfirmation: boolean;
  confirmationType: 'auto' | 'confirm_once' | 'always_confirm';
}

/**
 * Execute a write tool by calling the corresponding API route.
 * All write tools go through HTTP to preserve RBAC + validation.
 */
export async function executeWriteTool(
  toolName: string,
  args: Record<string, unknown>,
  workspaceId: string,
  authHeaders: Record<string, string>,
): Promise<WriteToolResult> {
  const start = Date.now();

  const TOOL_ROUTES: Record<string, { method: string; path: string; confirmationType: 'auto' | 'confirm_once' | 'always_confirm' }> = {
    content_create: { method: 'POST', path: '/api/content/generate', confirmationType: 'auto' },
    content_score: { method: 'POST', path: '/api/content/auto-improve', confirmationType: 'auto' },
    content_repurpose: { method: 'POST', path: '/api/content/repurpose', confirmationType: 'auto' },
    publish_schedule: { method: 'POST', path: '/api/publish', confirmationType: 'confirm_once' },
    publish_now: { method: 'POST', path: '/api/publish', confirmationType: 'always_confirm' },
    email_create: { method: 'POST', path: '/api/email/campaigns', confirmationType: 'auto' },
    email_schedule: { method: 'POST', path: '/api/email/campaigns/schedule', confirmationType: 'confirm_once' },
    images_generate: { method: 'POST', path: '/api/images/generate', confirmationType: 'auto' },
    leads_update: { method: 'PATCH', path: '/api/leads', confirmationType: 'confirm_once' },
    leads_enrich: { method: 'POST', path: '/api/leads/enrich', confirmationType: 'auto' },
    briefs_create: { method: 'POST', path: '/api/briefs', confirmationType: 'auto' },
    reports_generate: { method: 'POST', path: '/api/report-builder', confirmationType: 'confirm_once' },
    reports_send: { method: 'POST', path: '/api/report-builder', confirmationType: 'always_confirm' },
    links_create: { method: 'POST', path: '/api/links', confirmationType: 'auto' },
  };

  const route = TOOL_ROUTES[toolName];
  if (!route) {
    throw new Error(`Unknown write tool: ${toolName}`);
  }

  // Build the request body based on tool
  const body = buildRequestBody(toolName, args, workspaceId);

  try {
    const response = await fetch(`${BASE_URL}${route.path}`, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        result: { error: data.error ?? `API returned ${response.status}`, details: data },
        durationMs: Date.now() - start,
        requiresConfirmation: false,
        confirmationType: route.confirmationType,
      };
    }

    return {
      result: data,
      durationMs: Date.now() - start,
      requiresConfirmation: route.confirmationType !== 'auto',
      confirmationType: route.confirmationType,
    };
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'API call failed' },
      durationMs: Date.now() - start,
      requiresConfirmation: false,
      confirmationType: route.confirmationType,
    };
  }
}

function buildRequestBody(toolName: string, args: Record<string, unknown>, workspaceId: string): Record<string, unknown> {
  switch (toolName) {
    case 'content_create':
      return { prompt: args.prompt, contentType: args.contentType, channel: args.channel };
    case 'content_score':
      return { action: 'score', content: args.content, useCase: args.useCase, title: args.title, targetKeyword: args.targetKeyword };
    case 'content_repurpose':
      return { content: args.sourceContent, targetPlatform: args.targetPlatform, sourceContentId: args.sourceContentId };
    case 'publish_schedule':
      return { contentDraftId: args.contentDraftId, platform: args.platform, scheduledDate: args.scheduledDate, scheduledTime: args.scheduledTime };
    case 'publish_now':
      return { contentDraftId: args.contentDraftId, platform: args.platform, action: 'publish_now' };
    case 'email_create':
      return { name: args.name, subject: args.subject, previewText: args.previewText, htmlContent: args.htmlContent, fromName: args.fromName };
    case 'email_schedule':
      return { action: 'schedule', scheduledAt: args.scheduledAt };
    case 'images_generate':
      return { prompt: args.prompt, size: args.size, style: args.style };
    case 'leads_update':
      return { stage: args.stage, assignedTo: args.assignedTo, note: args.note, score: args.score };
    case 'leads_enrich':
      return {};
    case 'briefs_create':
      return args;
    case 'reports_generate':
      return { clientId: args.clientId, periodStart: args.periodStart, periodEnd: args.periodEnd, reportType: args.reportType };
    case 'reports_send':
      return { reportId: args.reportId, recipients: args.recipients, action: 'send' };
    case 'links_create':
      return { destinationUrl: args.destinationUrl, utmSource: args.utmSource, utmMedium: args.utmMedium, utmCampaign: args.utmCampaign, customSlug: args.customSlug };
    default:
      return args;
  }
}

/**
 * Check if a tool requires confirmation before execution.
 */
export function getConfirmationType(toolName: string): 'auto' | 'confirm_once' | 'always_confirm' {
  const CONFIRMATION_MAP: Record<string, 'auto' | 'confirm_once' | 'always_confirm'> = {
    // Auto-execute (reads + drafts)
    content_create: 'auto',
    content_score: 'auto',
    content_repurpose: 'auto',
    images_generate: 'auto',
    leads_enrich: 'auto',
    briefs_create: 'auto',
    links_create: 'auto',
    // Confirm once (scheduling + updates)
    publish_schedule: 'confirm_once',
    email_create: 'confirm_once',
    email_schedule: 'confirm_once',
    leads_update: 'confirm_once',
    reports_generate: 'confirm_once',
    // Always confirm (publish live + send)
    publish_now: 'always_confirm',
    reports_send: 'always_confirm',
  };
  return CONFIRMATION_MAP[toolName] ?? 'confirm_once';
}
