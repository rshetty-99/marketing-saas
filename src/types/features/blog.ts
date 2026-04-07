/**
 * Blog Module Types
 * Full blog system with authoring, public reading, comments,
 * analytics, SEO, DAM integration, and RSS.
 */

import type { FirestoreTimestamp } from './f0';

// ── Blog Post ──────────────────────────────────────────────

export type BlogPostStatus = 'draft' | 'review' | 'published' | 'archived';

export type BlogCategory =
  | 'ai_marketing'
  | 'agency_tips'
  | 'product_updates'
  | 'case_studies'
  | 'social_media'
  | 'seo_content'
  | 'email_marketing'
  | 'industry_news';

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'ai_marketing', label: 'AI Marketing' },
  { value: 'agency_tips', label: 'Agency Tips' },
  { value: 'product_updates', label: 'Product Updates' },
  { value: 'case_studies', label: 'Case Studies' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'seo_content', label: 'SEO & Content' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'industry_news', label: 'Industry News' },
];

export interface BlogAuthor {
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  bio?: string;
}

export interface BlogPost {
  id: string;
  workspaceId: string;

  // Content
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;      // Tiptap JSON
  contentHtml: string;                    // Pre-rendered, sanitized HTML

  // Media
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImageStoragePath?: string;         // gs:// path for deletion

  // Classification
  category: BlogCategory;
  tags: string[];

  // Author (denormalized)
  author: BlogAuthor;

  // Status & scheduling
  status: BlogPostStatus;
  publishedAt?: FirestoreTimestamp;
  scheduledAt?: FirestoreTimestamp;

  // Metrics (auto-calculated)
  wordCount: number;
  readTimeMinutes: number;

  // SEO
  seoTitle?: string;                     // Falls back to title
  seoDescription?: string;               // Falls back to excerpt
  ogImageUrl?: string;                   // Falls back to coverImageUrl
  canonicalUrl?: string;
  noindex: boolean;
  focusKeyword?: string;
  seoScore?: number;                     // From F10 seo-service

  // Engagement
  featured: boolean;
  allowComments: boolean;
  likes: number;
  views: number;
  uniqueVisitors: number;

  // Related
  relatedPostIds: string[];

  // Firestore required
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ── Comments ───────────────────────────────────────────────

export interface BlogComment {
  id: string;
  postId: string;
  workspaceId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;                       // Plain text only — sanitized
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ── Analytics ──────────────────────────────────────────────

export interface BlogViewEvent {
  id: string;
  postId: string;
  visitorHash: string;                   // SHA-256(IP + user-agent + daily salt)
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent: string;
  isBot: boolean;
  timestamp: FirestoreTimestamp;
}

export interface BlogScrollEvent {
  postId: string;
  visitorHash: string;
  maxDepthPercent: number;               // 25, 50, 75, or 100
  readCompleted: boolean;
  timeOnPageSeconds: number;
  timestamp: FirestoreTimestamp;
}

export interface BlogPostAnalytics {
  postId: string;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  completionRate: number;                // % who scrolled to 100%
  scrollDepth: {
    pct25: number;
    pct50: number;
    pct75: number;
    pct100: number;
  };
  trafficSources: {
    direct: number;
    social: number;
    organic: number;
    referral: number;
    email: number;
  };
  topReferrers: { url: string; count: number }[];
  shareClicks: { platform: string; count: number }[];
  ctaClicks: number;
  likes: number;
  comments: number;
}

// ── Blog Permissions ───────────────────────────────────────

export const BLOG_PERMISSIONS = {
  'blog.create': ['owner', 'admin', 'manager', 'editor'],
  'blog.edit_own': ['owner', 'admin', 'manager', 'editor'],
  'blog.edit_all': ['owner', 'admin', 'manager'],
  'blog.submit': ['owner', 'admin', 'manager', 'editor'],
  'blog.publish': ['owner', 'admin', 'manager'],
  'blog.delete': ['owner', 'admin'],
  'blog.manage_categories': ['owner', 'admin'],
  'blog.view_analytics': ['owner', 'admin', 'manager'],
} as const;

// ── Image Upload ───────────────────────────────────────────

export const BLOG_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const BLOG_IMAGE_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
