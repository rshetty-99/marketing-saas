import { z } from 'zod';

export const scoreContentSEOSchema = z.object({
  contentDraftId: z.string().min(1),
  focusKeyword: z.string().min(1).max(200),
});

export const keywordResearchSchema = z.object({
  keywords: z.array(z.string().min(1).max(200)).min(1).max(20),
});

export const contentBriefSchema = z.object({
  targetKeyword: z.string().min(1).max(200),
  competitorUrls: z.array(z.string().url()).max(10).optional(),
});

export const topicClusterSchema = z.object({
  pillarKeyword: z.string().min(1).max(200),
  clusterKeywords: z.array(z.string().max(200)).max(50).optional(),
});
