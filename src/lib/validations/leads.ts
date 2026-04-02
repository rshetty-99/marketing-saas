import { z } from 'zod';

export const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  jobTitle: z.string().max(100).optional(),
  leadSource: z.enum(['web_form', 'referral', 'paid_ad', 'cold_outreach', 'social', 'event', 'partner', 'inbound_email', 'other']),
  stage: z.string().min(1).max(50).optional(),
  dealValue: z.number().int().nonnegative().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  clientId: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial().extend({
  stage: z.string().optional(),
  lostReason: z.string().max(500).optional(),
  nextFollowUpAt: z.string().datetime().optional(),
  leadScore: z.number().int().optional(),
});

export const logActivitySchema = z.object({
  leadId: z.string().min(1),
  activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'sms', 'chat']),
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  durationSeconds: z.number().int().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  outcome: z.enum(['connected', 'no_answer', 'voicemail', 'busy']).optional(),
});

export const pipelineConfigSchema = z.object({
  stages: z.array(z.object({
    id: z.string().min(1).max(50),
    label: z.string().min(1).max(50),
    order: z.number().int().min(0),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    isWon: z.boolean().optional(),
    isLost: z.boolean().optional(),
    defaultProbability: z.number().min(0).max(100).optional(),
  })).min(2).max(20),
});
