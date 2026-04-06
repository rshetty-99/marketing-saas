/**
 * Aura Cortex — AI Marketing Command Center Types
 * Phase 11A: Foundation (read-only tools, SSE streaming, chat UI)
 */

import type { FirestoreTimestamp } from './f0';

// ── Session & Messages ─────────────────────────────────────

export interface CortexSession {
  id: string;
  workspaceId: string;
  userId: string;
  clientId?: string;
  title: string;
  messageCount: number;
  status: 'active' | 'archived';
  creditsConsumed: number;
  tokensConsumed: number;
  lastMessageAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

export interface CortexMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  inputMethod: CortexInputMethod;
  toolCalls?: CortexToolCall[];
  feedback?: CortexFeedback;
  tokenUsage?: { input: number; output: number };
  timestamp: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
  workspaceId: string;
}

export type CortexInputMethod = 'text' | 'voice' | 'slash_command' | 'suggestion_chip';

export interface CortexToolCall {
  toolName: string;
  arguments: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executionMode: 'direct_service' | 'api_route';
  durationMs?: number;
  error?: string;
}

export interface CortexFeedback {
  rating: 'positive' | 'negative';
  reason?: CortexFeedbackReason;
  freeText?: string;
  timestamp: FirestoreTimestamp;
}

export type CortexFeedbackReason = 'wrong_tool' | 'bad_quality' | 'missed_context' | 'too_slow' | 'other';

// ── Intent Classification ──────────────────────────────────

export type IntentCategory =
  | 'analytics' | 'content' | 'calendar' | 'leads' | 'clients'
  | 'seo' | 'hashtags' | 'listening' | 'workspace' | 'meta';

export interface IntentClassification {
  category: IntentCategory;
  confidence: number;
  requiredContextBlocks: ContextBlockType[];
  suggestedTools: string[];
}

// ── Context Assembly ───────────────────────────────────────

export type ContextBlockType =
  | 'workspace_basics' | 'active_client' | 'user_role' | 'recent_activity'
  | 'brand_voice' | 'recent_content' | 'analytics_trends'
  | 'calendar_upcoming' | 'team_members' | 'active_campaigns';

export interface ContextBlock {
  type: ContextBlockType;
  content: string;
  tokenEstimate: number;
  loadedAt: number;
}

// ── SSE Events ─────────────────────────────────────────────

export type CortexSSEEventType =
  | 'session_created' | 'text_delta' | 'tool_call_start'
  | 'tool_call_result' | 'done' | 'error';

export interface CortexSSEEvent {
  type: CortexSSEEventType;
  data: Record<string, unknown>;
}

// ── UI State ───────────────────────────────────────────────

export type DegradationLevel = 'full' | 'degraded' | 'slash_only' | 'offline';

export interface CortexUIState {
  isPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeSessionId: string | null;
  isStreaming: boolean;
  degradationLevel: DegradationLevel;
  queuedRequests: number;
}

export interface CortexOnboardingState {
  tooltipCompleted: boolean;
  tutorialCompleted: boolean;
  tutorialStep: number;
}
