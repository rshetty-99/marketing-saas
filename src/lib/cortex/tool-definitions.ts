/**
 * Cortex Tool Definitions — 14 Read-Only Tools (Phase 11A)
 * Each tool maps to a direct service function call.
 * Format: Claude API tool-use JSON schema.
 */

import type Anthropic from '@anthropic-ai/sdk';

export const CORTEX_TOOLS: Anthropic.Tool[] = [
  {
    name: 'analytics_overview',
    description: 'Get dashboard analytics overview (KPIs, engagement, reach, followers) for the workspace or a specific client. Use this when the user asks about performance, metrics, or how things are going.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateRange: { type: 'string', enum: ['last_7_days', 'last_30_days', 'last_90_days'], description: 'Time period for analytics' },
        clientId: { type: 'string', description: 'Specific client ID to scope analytics' },
      },
      required: [],
    },
  },
  {
    name: 'analytics_compare',
    description: 'Compare analytics between two time periods to show growth or decline.',
    input_schema: {
      type: 'object' as const,
      properties: {
        currentPeriod: { type: 'string', enum: ['last_7_days', 'last_30_days', 'last_90_days'] },
        clientId: { type: 'string' },
      },
      required: ['currentPeriod'],
    },
  },
  {
    name: 'analytics_compare_clients',
    description: 'Compare analytics across multiple agency clients. Shows which clients are performing best or worst.',
    input_schema: {
      type: 'object' as const,
      properties: {
        metric: { type: 'string', enum: ['engagement', 'reach', 'impressions', 'followers'], description: 'Metric to compare' },
        dateRange: { type: 'string', enum: ['last_7_days', 'last_30_days', 'last_90_days'] },
      },
      required: ['metric'],
    },
  },
  {
    name: 'content_list',
    description: 'List content drafts with optional filters. Use when user asks about their content, posts, drafts, or articles.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['draft', 'submitted', 'approved', 'scheduled', 'published', 'rejected', 'archived'] },
        contentType: { type: 'string', description: 'Filter by content type' },
        clientId: { type: 'string' },
        limit: { type: 'number', description: 'Number of results (max 50)' },
      },
      required: [],
    },
  },
  {
    name: 'content_get',
    description: 'Get full details of a specific content draft by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        draftId: { type: 'string', description: 'Content draft ID' },
      },
      required: ['draftId'],
    },
  },
  {
    name: 'calendar_upcoming',
    description: 'Get upcoming calendar events — scheduled posts, content deadlines, approval due dates.',
    input_schema: {
      type: 'object' as const,
      properties: {
        daysAhead: { type: 'number', description: 'How many days ahead to look (default 14, max 90)' },
        clientId: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'leads_list',
    description: 'List leads in the CRM pipeline with optional stage/assignee filters.',
    input_schema: {
      type: 'object' as const,
      properties: {
        stage: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] },
        assignedTo: { type: 'string', description: 'User ID of assignee' },
        limit: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'leads_get',
    description: 'Get details of a specific lead by ID or search by name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        leadId: { type: 'string' },
        searchName: { type: 'string', description: 'Search by lead name (first or last)' },
      },
      required: [],
    },
  },
  {
    name: 'clients_list',
    description: 'List all clients managed by this agency workspace.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max results (default 50)' },
      },
      required: [],
    },
  },
  {
    name: 'clients_health',
    description: 'Get health score breakdown for a specific client or all clients.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clientId: { type: 'string', description: 'Specific client ID. Omit for all clients.' },
      },
      required: [],
    },
  },
  {
    name: 'seo_keywords',
    description: 'Research keywords — get search volume, difficulty, and CPC data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords to research (max 20)' },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'hashtags_trending',
    description: 'Get trending hashtag data and analytics for given hashtags or an industry.',
    input_schema: {
      type: 'object' as const,
      properties: {
        hashtags: { type: 'array', items: { type: 'string' }, description: 'Specific hashtags to analyze' },
        industry: { type: 'string', description: 'Industry to find trending hashtags for' },
      },
      required: [],
    },
  },
  {
    name: 'listening_mentions',
    description: 'Get recent brand mentions and sentiment from social listening.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of mentions (default 20, max 50)' },
      },
      required: [],
    },
  },
  {
    name: 'workspace_info',
    description: 'Get workspace details — name, tier, account type, team size, subscription status.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];
