import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.record(z.string(), z.unknown()),  // Tiptap JSON
  contentHtml: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  coverImageAlt: z.string().max(200).optional(),
  coverImageStoragePath: z.string().optional(),
  category: z.enum(['ai_marketing', 'agency_tips', 'product_updates', 'case_studies', 'social_media', 'seo_content', 'email_marketing', 'industry_news']),
  tags: z.array(z.string().max(50)).max(20).default([]),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  ogImageUrl: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  noindex: z.boolean().default(false),
  focusKeyword: z.string().max(100).optional(),
  featured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  relatedPostIds: z.array(z.string()).max(5).default([]),
  scheduledAt: z.string().datetime().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const publishBlogPostSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'schedule']),
  scheduledAt: z.string().datetime().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const blogAnalyticsEventSchema = z.object({
  postId: z.string().min(1),
  eventType: z.enum(['view', 'scroll', 'share', 'cta_click']),
  data: z.object({
    referrer: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    scrollDepth: z.number().min(0).max(100).optional(),
    readCompleted: z.boolean().optional(),
    timeOnPageSeconds: z.number().min(0).max(7200).optional(),
    sharePlatform: z.string().optional(),
  }).default({}),
  timestamp: z.number().min(0),
});

export const blogListQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().max(200).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});
