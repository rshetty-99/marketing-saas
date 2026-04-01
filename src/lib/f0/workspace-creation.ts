import { clerkClient } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { AccountType, Tier } from '@/types/roles';

interface CreateWorkspaceInput {
  userId: string;
  email: string;
  displayName: string;
  accountType: AccountType;
  workspaceName: string;
  industry?: string;
}

const DEFAULT_TIER: Record<AccountType, Tier> = {
  freelancer: 'starter',
  organization: 'growth',
  agency: 'agency',
};

const MAX_SCORE: Record<AccountType, number> = {
  freelancer: 100,
  organization: 115,
  agency: 130,
};

const TRIAL_DAYS = 15;
const INITIAL_SCORE = 10;
const INITIAL_ACTIONS = ['account_type_selected', 'workspace_created'];

export async function createWorkspace(input: CreateWorkspaceInput): Promise<string> {
  try {
    const client = await clerkClient();

    // 1. Create Clerk organization
    const org = await client.organizations.createOrganization({
      name: input.workspaceName,
      createdBy: input.userId,
    });

    // 2. Calculate trial end date (15 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    // 3. Calculate initial profile score percentage
    const maxScore = MAX_SCORE[input.accountType];
    const percentage = Math.round((INITIAL_SCORE / maxScore) * 100);

    // 4. Batch write all Firestore documents
    const batch = adminDb.batch();

    // Workspace document
    const workspaceRef = adminDb.collection('workspaces').doc(org.id);
    batch.set(workspaceRef, {
      clerkOrgId: org.id,
      name: input.workspaceName,
      ownerId: input.userId,
      accountType: input.accountType,
      tier: DEFAULT_TIER[input.accountType],
      status: 'trial',
      industry: input.industry ?? null,
      trialEndsAt: Timestamp.fromDate(trialEndsAt),
      onboardingCompleted: false,
      onboardingStep: 2,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: input.userId,
    });

    // Owner member document
    const memberRef = workspaceRef.collection('members').doc(input.userId);
    batch.set(memberRef, {
      userId: input.userId,
      workspaceId: org.id,
      role: 'owner',
      status: 'active',
      email: input.email,
      displayName: input.displayName,
      invitedBy: input.userId,
      joinedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: input.userId,
    });

    // Entity profile (minimal — enriched later via Settings)
    const entityProfileRef = adminDb.collection('entity_profiles').doc(org.id);
    batch.set(entityProfileRef, {
      workspaceId: org.id,
      accountType: input.accountType,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      locale: 'en-US',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: input.userId,
    });

    // Initial profile score
    const scoreRef = workspaceRef.collection('profile_score').doc('current');
    batch.set(scoreRef, {
      workspaceId: org.id,
      accountType: input.accountType,
      completedActions: INITIAL_ACTIONS,
      score: INITIAL_SCORE,
      maxScore,
      percentage,
      widgetDismissed: false,
      calculatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: input.userId,
    });

    await batch.commit();

    return org.id;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create workspace: ${message}`);
  }
}
