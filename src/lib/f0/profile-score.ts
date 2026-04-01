import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { workspaceConverter, profileScoreConverter } from '@/lib/firebase/converters/workspace';
import type { AccountType } from '@/types/roles';
import type { ProfileScore } from '@/types/features/f0';

interface ScoreAction {
  key: string;
  points: number;
  appliesTo: AccountType[];
}

const ALL_ACCOUNT_TYPES: AccountType[] = ['freelancer', 'organization', 'agency'];
const ORG_AND_AGENCY: AccountType[] = ['organization', 'agency'];
const AGENCY_ONLY: AccountType[] = ['agency'];

export const SCORE_ACTIONS: ScoreAction[] = [
  { key: 'account_type_selected', points: 5, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'workspace_created', points: 5, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'brand_name_set', points: 10, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'brand_voice_set', points: 10, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'brand_guidelines_uploaded', points: 10, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'logo_uploaded', points: 5, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'social_account_connected', points: 15, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'email_provider_connected', points: 5, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'first_content_draft', points: 15, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'first_content_published', points: 10, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'billing_info_added', points: 10, appliesTo: ALL_ACCOUNT_TYPES },
  { key: 'team_member_invited', points: 10, appliesTo: ORG_AND_AGENCY },
  { key: 'approval_workflow_configured', points: 5, appliesTo: ORG_AND_AGENCY },
  { key: 'first_client_created', points: 10, appliesTo: AGENCY_ONLY },
  { key: 'client_portal_provisioned', points: 5, appliesTo: AGENCY_ONLY },
];

/**
 * Get the maximum possible score for an account type.
 */
function getMaxScore(accountType: AccountType): number {
  return SCORE_ACTIONS
    .filter((action) => action.appliesTo.includes(accountType))
    .reduce((sum, action) => sum + action.points, 0);
}

/**
 * Get the applicable actions for an account type.
 */
function getApplicableActions(accountType: AccountType): ScoreAction[] {
  return SCORE_ACTIONS.filter((action) => action.appliesTo.includes(accountType));
}

/**
 * Determine which score actions are completed by inspecting the workspace
 * and its related subcollections.
 */
async function detectCompletedActions(workspaceId: string): Promise<string[]> {
  const completed: string[] = [];

  try {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceSnap = await workspaceRef.withConverter(workspaceConverter).get();

    if (!workspaceSnap.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const workspace = workspaceSnap.data();
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} data is empty`);
    }

    // These are always completed if the workspace exists
    completed.push('account_type_selected', 'workspace_created');

    // Check workspace-level fields
    if (workspace.name && workspace.name.trim().length > 0) {
      completed.push('brand_name_set');
    }

    if (workspace.stripeCustomerId) {
      completed.push('billing_info_added');
    }

    // Run subcollection checks in parallel
    const [
      membersSnap,
      clientsSnap,
      brandSnap,
      integrationsSnap,
      contentSnap,
    ] = await Promise.all([
      workspaceRef.collection('members').where('status', '==', 'invited').limit(1).get(),
      workspaceRef.collection('clients').limit(1).get(),
      workspaceRef.collection('brand_settings').doc('current').get(),
      workspaceRef.collection('integrations').limit(5).get(),
      workspaceRef.collection('content').limit(5).get(),
    ]);

    // Team member invited
    if (!membersSnap.empty) {
      completed.push('team_member_invited');
    }

    // Client created (agency)
    if (!clientsSnap.empty) {
      completed.push('first_client_created');
    }

    // Brand settings
    if (brandSnap.exists) {
      const brandData = brandSnap.data();
      if (brandData) {
        if (brandData.voiceTone) {
          completed.push('brand_voice_set');
        }
        if (brandData.guidelinesUrl) {
          completed.push('brand_guidelines_uploaded');
        }
        if (brandData.logoUrl) {
          completed.push('logo_uploaded');
        }
      }
    }

    // Integrations
    if (!integrationsSnap.empty) {
      for (const doc of integrationsSnap.docs) {
        const data = doc.data();
        if (data.type === 'social' && data.status === 'connected') {
          completed.push('social_account_connected');
        }
        if (data.type === 'email' && data.status === 'connected') {
          completed.push('email_provider_connected');
        }
      }
    }

    // Content
    if (!contentSnap.empty) {
      for (const doc of contentSnap.docs) {
        const data = doc.data();
        if (data.status === 'draft' || data.status === 'published') {
          completed.push('first_content_draft');
        }
        if (data.status === 'published') {
          completed.push('first_content_published');
        }
      }
    }

    // Check for approval workflow configuration
    const workflowSnap = await workspaceRef
      .collection('settings')
      .doc('approval_workflow')
      .get();

    if (workflowSnap.exists) {
      completed.push('approval_workflow_configured');
    }

    // Check for client portal provisioning (agency only)
    if (workspace.accountType === 'agency' && !clientsSnap.empty) {
      for (const doc of clientsSnap.docs) {
        const data = doc.data();
        if (data.portalEnabled) {
          completed.push('client_portal_provisioned');
          break;
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to detect completed actions: ${message}`);
  }

  // Deduplicate
  return [...new Set(completed)];
}

/**
 * Calculate profile completeness score for a workspace.
 * Reads workspace and related collections, determines which actions are completed,
 * and writes the score document.
 */
export async function calculateProfileScore(workspaceId: string): Promise<ProfileScore> {
  const workspaceSnap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .withConverter(workspaceConverter)
    .get();

  if (!workspaceSnap.exists) {
    throw new Error(`Workspace ${workspaceId} not found`);
  }

  const workspace = workspaceSnap.data();
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} data is empty`);
  }

  const accountType = workspace.accountType;
  const completedActions = await detectCompletedActions(workspaceId);

  // Filter to only applicable actions for this account type
  const applicableActions = getApplicableActions(accountType);
  const applicableCompleted = completedActions.filter((action) =>
    applicableActions.some((a) => a.key === action),
  );

  const score = applicableActions
    .filter((action) => applicableCompleted.includes(action.key))
    .reduce((sum, action) => sum + action.points, 0);

  const maxScore = getMaxScore(accountType);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const scoreRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('profile_score')
    .doc('current');

  const scoreData = {
    workspaceId,
    accountType,
    completedActions: applicableCompleted,
    score,
    maxScore,
    percentage,
    widgetDismissed: false,
    calculatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Merge to preserve createdAt and createdBy if they exist
  const existingSnap = await scoreRef.get();
  if (existingSnap.exists) {
    await scoreRef.update(scoreData);
  } else {
    await scoreRef.set({
      ...scoreData,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: workspace.ownerId,
    });
  }

  // Read back the written document for return
  const resultSnap = await scoreRef.withConverter(profileScoreConverter).get();
  const result = resultSnap.data();
  if (!result) {
    throw new Error('Failed to read back profile score after write');
  }

  return result;
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get the cached profile score, recalculating if stale (>5 minutes old).
 */
export async function getProfileScore(workspaceId: string): Promise<ProfileScore> {
  try {
    const scoreSnap = await adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .collection('profile_score')
      .doc('current')
      .withConverter(profileScoreConverter)
      .get();

    if (scoreSnap.exists) {
      const scoreData = scoreSnap.data();
      if (scoreData) {
        const calculatedAt = scoreData.calculatedAt;
        if (calculatedAt instanceof Timestamp) {
          const ageMs = Date.now() - calculatedAt.toMillis();
          if (ageMs < STALE_THRESHOLD_MS) {
            return scoreData;
          }
        }
      }
    }

    // Score doesn't exist or is stale — recalculate
    return await calculateProfileScore(workspaceId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get profile score: ${message}`);
  }
}
