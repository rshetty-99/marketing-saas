/**
 * Cortex Write Tool Definitions — 14 Write Tools (Phase 11B)
 * Each tool maps to an existing API route (with RBAC + Zod validation).
 * Write tools go through API routes, not direct service calls (Decision 1).
 */

import type Anthropic from '@anthropic-ai/sdk';

export const CORTEX_WRITE_TOOLS: Anthropic.Tool[] = [
  {
    name: 'content_create',
    description: 'Generate a new content draft using AI. Creates a blog post, social post, email, or other content type using the brand voice.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: { type: 'string', description: 'What to write about' },
        contentType: { type: 'string', enum: ['blog_post', 'social_post', 'email_newsletter', 'ad_copy', 'video_script', 'case_study', 'landing_page_copy'], description: 'Type of content to create' },
        channel: { type: 'string', enum: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'blog', 'email'], description: 'Target platform/channel' },
        title: { type: 'string', description: 'Optional title for the content' },
      },
      required: ['prompt', 'contentType'],
    },
  },
  {
    name: 'content_score',
    description: 'Score a content draft for SEO, GEO (AI citability), readability, and brand voice alignment. Returns scores and improvement suggestions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        content: { type: 'string', description: 'The content to score' },
        useCase: { type: 'string', description: 'Use case preset (blog_post, linkedin_post, etc.)' },
        title: { type: 'string' },
        targetKeyword: { type: 'string' },
      },
      required: ['content', 'useCase'],
    },
  },
  {
    name: 'content_repurpose',
    description: 'Repurpose existing content for a different platform. Adapts tone, length, format, and hashtags for the target platform.',
    input_schema: {
      type: 'object' as const,
      properties: {
        sourceContent: { type: 'string', description: 'Original content to repurpose' },
        targetPlatform: { type: 'string', enum: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'blog', 'email'] },
        sourceContentId: { type: 'string', description: 'Optional ID of the source draft' },
      },
      required: ['sourceContent', 'targetPlatform'],
    },
  },
  {
    name: 'publish_schedule',
    description: 'Schedule content for publishing at a specific date and time on a platform.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contentDraftId: { type: 'string', description: 'ID of the content draft to schedule' },
        platform: { type: 'string', enum: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest'] },
        scheduledDate: { type: 'string', description: 'ISO date string for when to publish' },
        scheduledTime: { type: 'string', description: 'Time in HH:MM format' },
      },
      required: ['contentDraftId', 'platform', 'scheduledDate'],
    },
  },
  {
    name: 'publish_now',
    description: 'Publish content immediately to a connected social platform. Requires the platform to be connected.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contentDraftId: { type: 'string', description: 'ID of the content draft to publish' },
        platform: { type: 'string', enum: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest'] },
      },
      required: ['contentDraftId', 'platform'],
    },
  },
  {
    name: 'email_create',
    description: 'Create a new email campaign with subject, body, and recipient list.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Campaign name' },
        subject: { type: 'string', description: 'Email subject line' },
        previewText: { type: 'string', description: 'Preview text shown in inbox' },
        htmlContent: { type: 'string', description: 'Email HTML body content' },
        fromName: { type: 'string' },
      },
      required: ['name', 'subject'],
    },
  },
  {
    name: 'email_schedule',
    description: 'Schedule an email campaign for sending at a specific date and time.',
    input_schema: {
      type: 'object' as const,
      properties: {
        campaignId: { type: 'string', description: 'ID of the email campaign' },
        scheduledAt: { type: 'string', description: 'ISO datetime for when to send' },
      },
      required: ['campaignId', 'scheduledAt'],
    },
  },
  {
    name: 'images_generate',
    description: 'Generate an AI image with a text prompt. Creates brand-aligned visuals for social posts, blog headers, and ads.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: { type: 'string', description: 'Description of the image to generate' },
        size: { type: 'string', enum: ['1080x1080', '1200x628', '1200x675', '1600x840', '1080x1920'], description: 'Image dimensions' },
        style: { type: 'string', enum: ['photorealistic', 'illustration', 'minimalist', 'bold', 'vintage', 'corporate'] },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'leads_update',
    description: 'Update a lead in the CRM pipeline — change stage, assign to team member, add notes, or update score.',
    input_schema: {
      type: 'object' as const,
      properties: {
        leadId: { type: 'string', description: 'ID of the lead to update' },
        stage: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] },
        assignedTo: { type: 'string', description: 'User ID of the team member to assign to' },
        note: { type: 'string', description: 'Note to add to the lead' },
        score: { type: 'number', description: 'Lead score (1-5)' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'leads_enrich',
    description: 'Trigger enrichment for a lead — auto-populates company, job title, LinkedIn URL from email domain.',
    input_schema: {
      type: 'object' as const,
      properties: {
        leadId: { type: 'string', description: 'ID of the lead to enrich' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'briefs_create',
    description: 'Create a content brief with objectives, target audience, keywords, and assign to a writer.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Brief title' },
        objective: { type: 'string', description: 'What should this content achieve?' },
        targetAudience: { type: 'string', description: 'Who is the target reader?' },
        platform: { type: 'string', description: 'Target platform' },
        keywords: { type: 'array', items: { type: 'string' }, description: 'SEO keywords to target' },
        wordCountTarget: { type: 'number', description: 'Target word count' },
        assignedTo: { type: 'string', description: 'User ID of the writer to assign to' },
        dueDate: { type: 'string', description: 'ISO date for the deadline' },
      },
      required: ['title', 'objective'],
    },
  },
  {
    name: 'reports_generate',
    description: 'Generate a client performance report for a specific time period. Creates a report with analytics, insights, and recommendations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clientId: { type: 'string', description: 'Client ID (for agency accounts)' },
        periodStart: { type: 'string', description: 'Start date (ISO)' },
        periodEnd: { type: 'string', description: 'End date (ISO)' },
        reportType: { type: 'string', enum: ['monthly', 'weekly', 'custom'] },
      },
      required: ['periodStart', 'periodEnd'],
    },
  },
  {
    name: 'reports_send',
    description: 'Send a generated report to the client via email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reportId: { type: 'string', description: 'ID of the report to send' },
        recipients: { type: 'array', items: { type: 'string' }, description: 'Email addresses to send to' },
      },
      required: ['reportId', 'recipients'],
    },
  },
  {
    name: 'links_create',
    description: 'Create a branded short link with UTM tracking parameters.',
    input_schema: {
      type: 'object' as const,
      properties: {
        destinationUrl: { type: 'string', description: 'The URL to shorten' },
        utmSource: { type: 'string', description: 'UTM source parameter' },
        utmMedium: { type: 'string', description: 'UTM medium parameter' },
        utmCampaign: { type: 'string', description: 'UTM campaign parameter' },
        customSlug: { type: 'string', description: 'Custom short link slug' },
      },
      required: ['destinationUrl'],
    },
  },
];
