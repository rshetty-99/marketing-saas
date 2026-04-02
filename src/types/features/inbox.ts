/**
 * Unified Inbox + Webhook Ingestion Types
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// WEBHOOK INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════

export interface WebhookConfig {
  id: string;
  workspaceId: string;
  platform: string;
  signingSecret: string;               // Encrypted
  algorithm: 'sha256' | 'sha1' | 'hmac-sha256';
  headerName: string;                  // e.g., 'X-Hub-Signature-256'
  verified: boolean;
  // Health metrics
  successRate: number;                 // 0-1
  avgProcessingTimeMs: number;
  lastFailureAt?: FirestoreTimestamp;
  consecutiveFailures: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface WebhookRegistration {
  id: string;
  workspaceId: string;
  platform: string;
  callbackUrl: string;
  subscribedEvents: string[];
  externalSubscriptionId?: string;
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: FirestoreTimestamp;
  lastRenewedAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

export type WebhookEventStatus = 'pending' | 'processed' | 'failed' | 'dead_letter';

export interface WebhookEvent {
  id: string;
  workspaceId: string;
  platform: string;
  eventType: string;
  platformEventId: string;
  deduplicationKey: string;
  rawPayload: Record<string, unknown>;
  normalizedPayload?: Record<string, unknown>;
  status: WebhookEventStatus;
  processAttempts: number;
  lastAttemptAt?: FirestoreTimestamp;
  lastError?: string;
  nextRetryAt?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

export interface EventTransformationRule {
  id: string;
  platform: string;
  eventType: string;
  fieldMapping: Record<string, string>; // platform field → canonical field
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════
// UNIFIED INBOX
// workspaces/{workspaceId}/inbox_items/{itemId}
// ═══════════════════════════════════════════════════════════

export type InboxItemType = 'comment' | 'dm' | 'mention' | 'review' | 'reaction';
export type InboxItemStatus = 'new' | 'assigned' | 'replied' | 'archived' | 'snoozed';
export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InboxItem {
  id: string;
  workspaceId: string;
  connectionId: string;                // F9 social connection
  platform: string;
  type: InboxItemType;
  status: InboxItemStatus;
  priority: InboxPriority;

  // Content
  content: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  authorPlatformId: string;

  // Thread
  conversationThreadId: string;
  parentMessageId?: string;
  threadDepth: number;
  threadLastActivityAt: FirestoreTimestamp;

  // Context links
  linkedPostId?: string;               // Which published post this is on
  contactId?: string;                  // Link to leads/{leadId} or client contact
  clientId?: string;

  // Assignment
  assignedTo?: string;                 // userId
  activeEditors?: string[];            // Collision detection — who's currently typing

  // Sentiment
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;             // -1 to 1

  // SLA
  receivedAt: FirestoreTimestamp;
  firstResponseAt?: FirestoreTimestamp;
  slaDeadlineAt?: FirestoreTimestamp;
  slaBreach: boolean;

  // Snooze
  snoozedUntil?: FirestoreTimestamp;
  snoozedBy?: string;

  // Internal notes (team-only, not visible to external)
  internalNotes?: { authorId: string; body: string; createdAt: FirestoreTimestamp }[];

  tags: string[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface InboxReply {
  id: string;
  inboxItemId: string;
  responderId: string;
  content: string;
  sentVia: 'platform' | 'unified_inbox';
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  sentAt: FirestoreTimestamp;
}

export interface CannedResponse {
  id: string;
  workspaceId: string;
  title: string;
  body: string;
  shortcut?: string;                   // e.g., '/thanks'
  category?: string;
  variables: string[];                 // e.g., ['{{customerName}}']
  createdBy: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface SlaPolicy {
  id: string;
  workspaceId: string;
  platform?: string;                   // null = all platforms
  priority: InboxPriority;
  maxResponseMinutes: number;
  createdAt: FirestoreTimestamp;
}

export interface AssignmentRule {
  id: string;
  workspaceId: string;
  strategy: 'round_robin' | 'keyword' | 'platform' | 'sentiment';
  keywords?: string[];
  platformFilter?: string[];
  assignToPool: string[];              // userIds
  currentIndex: number;                // For round-robin
  enabled: boolean;
  priority: number;
  createdAt: FirestoreTimestamp;
}
