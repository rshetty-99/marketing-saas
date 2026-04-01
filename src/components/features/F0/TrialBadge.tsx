'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrialBadgeProps {
  trialEndsAt: Date;
}

export function TrialBadge({ trialEndsAt }: TrialBadgeProps) {
  const daysLeft = useMemo(() => {
    const now = new Date();
    const diff = trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trialEndsAt]);

  const isUrgent = daysLeft < 3;

  return (
    <Badge
      data-testid="trial-badge"
      className={cn(
        'bg-orange-500/15 text-orange-400 border-orange-500/25 gap-1.5',
        isUrgent && 'animate-pulse',
      )}
    >
      <Clock className="size-3" />
      {daysLeft === 0 ? 'Trial expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
    </Badge>
  );
}
