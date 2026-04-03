/**
 * F12 (Addendum) / Social Listening & Alerts Types
 *
 * Keyword monitoring, mention feeds, sentiment analysis,
 * competitor tracking, email digests.
 */

import type { FirestoreTimestamp } from './f0';

// ── Listening Configuration ────────────────────────────────

export interface ListeningConfig {
  id: string;
  workspaceId: string;
  brandKeywords: string[];
  competitorKeywords: string[];
  topicKeywords: string[];
  platforms: ListeningPlatform[];
  alertEmail: string;
  digestFrequency: 'realtime' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export type ListeningPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'web';

// ── Feed Items (Mentions) ──────────────────────────────────

export type MentionSentiment = 'positive' | 'neutral' | 'negative';
export type MentionStatus = 'new' | 'actioned' | 'dismissed' | 'saved';
export type KeywordType = 'brand' | 'competitor' | 'topic';

export interface ListeningFeedItem {
  id: string;
  workspaceId: string;
  configId: string;
  platform: string;
  mentionUrl: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  textSnippet: string;
  sentiment: MentionSentiment;
  sentimentScore: number;             // -1.0 to 1.0
  matchedKeyword: string;
  keywordType: KeywordType;
  status: MentionStatus;
  mentionedAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
