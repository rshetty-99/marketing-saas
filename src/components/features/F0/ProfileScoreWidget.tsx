'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProfileScoreWidgetProps {
  score: number;
  maxScore: number;
  onDismiss: () => void;
  dismissed?: boolean;
}

export function ProfileScoreWidget({
  score,
  maxScore,
  onDismiss,
  dismissed,
}: ProfileScoreWidgetProps) {
  const percentage = useMemo(() => {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  }, [score, maxScore]);

  if (dismissed) return null;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card data-testid="profile-score-widget" className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2"
        onClick={onDismiss}
        aria-label="Dismiss profile score"
      >
        <X className="size-3.5" />
      </Button>

      <CardContent className="flex items-center gap-4 pt-2">
        <div className="relative flex size-20 shrink-0 items-center justify-center">
          <svg
            className="-rotate-90"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
              className="stroke-muted"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-brand-orange transition-all duration-500"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="absolute text-heading-lg font-display text-foreground">
            {percentage}%
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-heading-md font-display text-foreground">
            Complete your profile
          </p>
          <p className="text-body-sm font-body text-muted-foreground">
            {score} of {maxScore} tasks done
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
