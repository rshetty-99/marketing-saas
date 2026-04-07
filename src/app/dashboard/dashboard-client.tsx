'use client';

import { TrialBadge } from '@/components/features/F0/TrialBadge';
import { ProfileScoreWidget } from '@/components/features/F0/ProfileScoreWidget';
import { ProfileScoreChecklist } from '@/components/features/F0/ProfileScoreChecklist';
import { useState } from 'react';
import type { AccountType } from '@/types/roles';

interface DashboardClientProps {
  trialEndsAt?: string;
  profileScore?: {
    score: number;
    maxScore: number;
    completedActions: string[];
  };
  workspaceId?: string;
  accountType?: string;
}

export function DashboardClient({
  trialEndsAt,
  profileScore,
  workspaceId,
  accountType,
}: DashboardClientProps) {
  const [dismissed, setDismissed] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);

  return (
    <>
      {trialEndsAt && !profileScore && (
        <TrialBadge trialEndsAt={new Date(trialEndsAt)} />
      )}

      {profileScore && workspaceId && (
        <ProfileScoreWidget
          score={profileScore.score}
          maxScore={profileScore.maxScore}
          onDismiss={() => setDismissed(true)}
          onViewChecklist={() => setChecklistOpen(true)}
          dismissed={dismissed}
        />
      )}

      <ProfileScoreChecklist
        completedActions={profileScore?.completedActions ?? []}
        accountType={(accountType as AccountType) ?? 'freelancer'}
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
      />
    </>
  );
}
