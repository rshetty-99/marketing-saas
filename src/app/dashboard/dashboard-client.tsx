'use client';

import { TrialBadge } from '@/components/features/F0/TrialBadge';
import { ProfileScoreWidget } from '@/components/features/F0/ProfileScoreWidget';
import { useState } from 'react';

interface DashboardClientProps {
  trialEndsAt?: string;
  profileScore?: {
    score: number;
    maxScore: number;
  };
  workspaceId?: string;
}

export function DashboardClient({
  trialEndsAt,
  profileScore,
  workspaceId,
}: DashboardClientProps) {
  const [dismissed, setDismissed] = useState(false);

  if (trialEndsAt && !profileScore) {
    return <TrialBadge trialEndsAt={new Date(trialEndsAt)} />;
  }

  if (profileScore && workspaceId) {
    return (
      <ProfileScoreWidget
        score={profileScore.score}
        maxScore={profileScore.maxScore}
        onDismiss={() => setDismissed(true)}
        dismissed={dismissed}
      />
    );
  }

  return null;
}
