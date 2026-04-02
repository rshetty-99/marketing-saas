/**
 * F6: Approval Workflow Service
 *
 * Handles submission, approval, rejection, reassignment,
 * multi-stage progression, and escalation.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { ApprovalStatus } from '@/types/features/content';

// ─── Submit for Approval ────────────────────────────────────

export async function submitForApproval(
  workspaceId: string,
  contentDraftId: string,
  submittedBy: string,
  approverUserId?: string,
  workflowTemplateId?: string,
): Promise<string> {
  // Fetch the draft
  const draftRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(contentDraftId);

  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) throw new Error('Draft not found');

  const draft = draftSnap.data();
  if (draft?.status !== 'draft' && draft?.status !== 'rejected') {
    throw new Error(`Cannot submit draft with status "${draft?.status}"`);
  }

  // Build stages
  let stages;
  if (workflowTemplateId) {
    // Multi-stage from template
    const templateSnap = await adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .collection('approval_workflows')
      .doc(workflowTemplateId)
      .get();

    if (!templateSnap.exists) throw new Error('Workflow template not found');
    const template = templateSnap.data();

    stages = (template?.stages ?? []).map((stage: Record<string, unknown>, index: number) => ({
      stageId: `stage_${index}`,
      stageName: stage.stageName ?? `Stage ${index + 1}`,
      stageOrder: index,
      stageType: stage.stageType ?? 'internal',
      approvalMode: stage.approvalMode ?? 'any_one',
      status: index === 0 ? 'in_review' : 'pending',
      assignedApproverIds: stage.approverUserIds ?? [],
      decisions: [],
      slaHours: stage.slaHours ?? null,
      startedAt: index === 0 ? FieldValue.serverTimestamp() : null,
      comments: [],
    }));
  } else {
    // Single-stage
    stages = [{
      stageId: 'stage_0',
      stageName: 'Review',
      stageOrder: 0,
      stageType: 'internal',
      approvalMode: 'any_one',
      status: 'in_review',
      assignedApproverIds: approverUserId ? [approverUserId] : [],
      decisions: [],
      startedAt: FieldValue.serverTimestamp(),
      comments: [],
    }];
  }

  // Create approval request
  const approvalRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('approvals')
    .doc();

  await approvalRef.set({
    id: approvalRef.id,
    workspaceId,
    contentDraftId,
    workflowTemplateId: workflowTemplateId ?? null,
    submittedBy,
    submittedAt: FieldValue.serverTimestamp(),
    status: 'in_review' as ApprovalStatus,
    currentStageIndex: 0,
    stages,
    revisionNumber: 1,
    resetsChainOnReject: true,
    contentSnapshot: {
      title: draft?.title ?? '',
      content: draft?.content ?? '',
      contentType: draft?.contentType ?? '',
      versionNumber: draft?.currentVersionNumber ?? 1,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update draft status
  await draftRef.update({
    status: 'submitted',
    linkedApprovalId: approvalRef.id,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'content.approved',
    resourceType: 'content',
    resourceId: contentDraftId,
    actorId: submittedBy,
    details: { approvalId: approvalRef.id, action: 'submitted' },
  });

  return approvalRef.id;
}

// ─── Make Decision (approve/reject/changes_requested) ───────

export async function makeDecision(
  workspaceId: string,
  approvalId: string,
  decidedBy: string,
  action: 'approved' | 'rejected' | 'changes_requested' | 'reassigned',
  feedback?: Record<string, unknown>[],
  reassignedToId?: string,
): Promise<void> {
  const approvalRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('approvals')
    .doc(approvalId);

  const approvalSnap = await approvalRef.get();
  if (!approvalSnap.exists) throw new Error('Approval request not found');

  const approval = approvalSnap.data();
  const currentStageIndex = approval?.currentStageIndex ?? 0;
  const stages = [...(approval?.stages ?? [])];
  const currentStage = stages[currentStageIndex];

  if (!currentStage || currentStage.status !== 'in_review') {
    throw new Error('Current stage is not in review');
  }

  // Record the decision
  currentStage.decisions = [
    ...(currentStage.decisions ?? []),
    {
      approverId: decidedBy,
      action,
      feedback: feedback ?? [],
      reassignedToId: reassignedToId ?? null,
      decidedAt: new Date().toISOString(),
    },
  ];

  if (action === 'approved') {
    currentStage.status = 'approved';
    currentStage.completedAt = new Date().toISOString();

    // Check if there are more stages
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      // Advance to next stage
      stages[nextStageIndex].status = 'in_review';
      stages[nextStageIndex].startedAt = new Date().toISOString();

      await approvalRef.update({
        stages,
        currentStageIndex: nextStageIndex,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // All stages complete — fully approved
      await approvalRef.update({
        stages,
        status: 'approved' as ApprovalStatus,
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: decidedBy,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update draft status to approved
      await adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .collection('content_drafts')
        .doc(approval?.contentDraftId)
        .update({
          status: 'approved',
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
  } else if (action === 'rejected' || action === 'changes_requested') {
    currentStage.status = 'rejected';
    currentStage.completedAt = new Date().toISOString();

    await approvalRef.update({
      stages,
      status: 'rejected' as ApprovalStatus,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: decidedBy,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update draft status back to draft (for revision)
    await adminDb
      .collection('workspaces')
      .doc(workspaceId)
      .collection('content_drafts')
      .doc(approval?.contentDraftId)
      .update({
        status: 'rejected',
        updatedAt: FieldValue.serverTimestamp(),
      });
  } else if (action === 'reassigned' && reassignedToId) {
    currentStage.assignedApproverIds = [reassignedToId];
    await approvalRef.update({
      stages,
      status: 'reassigned' as ApprovalStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await writeAuditLog(workspaceId, {
    action: action === 'approved' ? 'content.approved' : 'content.rejected',
    resourceType: 'content',
    resourceId: approval?.contentDraftId,
    actorId: decidedBy,
    details: { approvalId, action, stageIndex: currentStageIndex },
  });
}

// ─── List Approvals ─────────────────────────────────────────

export async function listApprovals(
  workspaceId: string,
  filters: {
    status?: string;
    assignedTo?: string;
    submittedBy?: string;
    limit?: number;
  } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('approvals')
    .orderBy('createdAt', 'desc')
    .limit(filters.limit ?? 50) as FirebaseFirestore.Query;

  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.submittedBy) query = query.where('submittedBy', '==', filters.submittedBy);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Get Eligible Approvers ─────────────────────────────────

export async function getEligibleApprovers(
  workspaceId: string,
): Promise<{ userId: string; displayName: string; role: string }[]> {
  const membersSnap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .where('status', '==', 'active')
    .get();

  const eligibleRoles = ['owner', 'admin', 'manager'];
  return membersSnap.docs
    .filter((doc) => eligibleRoles.includes(doc.data().role))
    .map((doc) => ({
      userId: doc.id,
      displayName: doc.data().displayName ?? '',
      role: doc.data().role,
    }));
}
