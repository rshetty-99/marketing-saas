import { z } from 'zod';

export const cortexChatSchema = z.object({
  message: z.string().min(1).max(10000),
  sessionId: z.string().optional(),
  inputMethod: z.enum(['text', 'voice', 'slash_command', 'suggestion_chip']).default('text'),
  clientId: z.string().optional(),
  isQuickCommand: z.boolean().default(false),
  singleShot: z.boolean().default(false),
});

export const cortexSessionsListSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['active', 'archived']).optional(),
  clientId: z.string().optional(),
});

export const cortexFeedbackSchema = z.object({
  messageId: z.string().min(1),
  sessionId: z.string().min(1),
  rating: z.enum(['positive', 'negative']),
  reason: z.enum(['wrong_tool', 'bad_quality', 'missed_context', 'too_slow', 'other']).optional(),
  freeText: z.string().max(500).optional(),
});
