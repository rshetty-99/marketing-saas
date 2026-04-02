/**
 * Automation Engine Types — shared by lead nurture (F12) and drip sequences (F11)
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// AUTOMATION WORKFLOW — workspaces/{workspaceId}/automations/{workflowId}
// ═══════════════════════════════════════════════════════════

export type AutomationTriggerType =
  | 'lead_stage_change' | 'tag_added' | 'form_submitted'
  | 'link_clicked' | 'inactivity' | 'date_field'
  | 'segment_entered' | 'manual' | 'api' | 'schedule';

export type AutomationStepType = 'email' | 'delay' | 'condition' | 'action' | 'split';

export type AutomationActionType =
  | 'send_email' | 'add_tag' | 'remove_tag' | 'change_stage'
  | 'assign_to' | 'notify_owner' | 'update_field' | 'webhook'
  | 'move_to_list' | 'create_task';

export interface AutomationStep {
  id: string;
  stepType: AutomationStepType;
  order: number;

  // Email step
  emailTemplateId?: string;
  emailSubject?: string;

  // Delay step
  delayValue?: number;
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';

  // Condition step (if/then branching)
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set';
    value: unknown;
    trueBranch: string;                // stepId to jump to
    falseBranch: string;
  };

  // Action step
  action?: {
    type: AutomationActionType;
    config: Record<string, unknown>;
  };

  // Split step (A/B testing within workflow)
  split?: {
    variants: {
      id: string;
      label: string;
      percent: number;                 // Must sum to 100
      nextStepId: string;
    }[];
  };
}

export interface AutomationWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';

  // Trigger
  triggerType: AutomationTriggerType;
  triggerConfig?: Record<string, unknown>;

  // Steps
  steps: AutomationStep[];

  // Exit conditions
  exitConditions?: {
    type: 'field_match' | 'tag_added' | 'goal_met' | 'manual';
    field?: string;
    operator?: string;
    value?: unknown;
  }[];
  exitOnGoalMet: boolean;

  // Goal tracking
  goalCondition?: {
    type: string;
    field?: string;
    operator?: string;
    value?: unknown;
  };
  goalWindowDays?: number;

  // Conflict resolution
  exclusivityGroup?: string;           // Only one workflow per group per entity
  conflictStrategy: 'skip' | 'exit_existing' | 'allow_parallel';
  priority: number;

  // Contact throttling (cross-workflow)
  maxMessagesPerContactPerDay?: number;

  // Metrics
  enrollmentCount: number;
  completionCount: number;
  goalMetCount: number;

  clientId?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// ENROLLMENT — workspaces/{workspaceId}/workflow_enrollments/{enrollmentId}
// ═══════════════════════════════════════════════════════════

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'exited' | 'errored';

export interface WorkflowEnrollment {
  id: string;
  workflowId: string;
  workspaceId: string;
  entityId: string;                    // Lead ID, subscriber ID, etc.
  entityType: 'lead' | 'contact' | 'subscriber';
  currentStepIndex: number;
  status: EnrollmentStatus;
  enrolledAt: FirestoreTimestamp;
  lastStepCompletedAt?: FirestoreTimestamp;
  nextStepAt?: FirestoreTimestamp;
  exitReason?: string;
  exitedAt?: FirestoreTimestamp;
}

// ═══════════════════════════════════════════════════════════
// EXECUTION LOG — workspaces/{workspaceId}/workflow_execution_logs/{logId}
// ═══════════════════════════════════════════════════════════

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  enrollmentId: string;
  workspaceId: string;
  stepIndex: number;
  stepType: AutomationStepType;
  status: 'success' | 'failure' | 'skipped';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string;
  executedAt: FirestoreTimestamp;
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════
// GOAL METRICS — workspaces/{workspaceId}/workflow_goal_metrics/{workflowId}
// ═══════════════════════════════════════════════════════════

export interface WorkflowGoalMetrics {
  workflowId: string;
  workspaceId: string;
  totalEnrolled: number;
  goalMet: number;
  goalMetRate: number;                 // 0-1
  avgTimeToGoalMs: number;
  lastCalculatedAt: FirestoreTimestamp;
}
