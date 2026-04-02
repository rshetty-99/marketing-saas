import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  previewText: z.string().max(200).optional(),
  fromName: z.string().min(1).max(100),
  fromEmail: z.string().email(),
  replyToEmail: z.string().email().optional(),
  templateId: z.string().optional(),
  htmlContent: z.string().max(500000),
  campaignType: z.enum(['regular', 'automated', 'ab_test', 'rss', 'transactional']).optional(),
  listId: z.string().optional(),
  tagFilters: z.array(z.string()).max(20).optional(),
  excludeTags: z.array(z.string()).max(20).optional(),
  scheduledAt: z.string().datetime().optional(),
  clickTrackingEnabled: z.boolean().optional(),
  openTrackingEnabled: z.boolean().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const importSubscribersSchema = z.object({
  subscribers: z.array(z.object({
    email: z.string().email(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    tags: z.array(z.string()).max(20).optional(),
  })).min(1).max(10000),
  source: z.enum(['import', 'form', 'api', 'manual', 'landing_page']).optional(),
});

export const sendCampaignSchema = z.object({
  campaignId: z.string().min(1),
});
