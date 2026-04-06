'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const NEGATIVE_REASONS = [
  'Wrong tool',
  'Bad quality',
  'Missed context',
  'Too slow',
  'Other',
] as const;

type NegativeReason = (typeof NEGATIVE_REASONS)[number];

interface CortexFeedbackProps {
  messageId: string;
  onSubmit: (messageId: string, feedback: { rating: 'positive' | 'negative'; reason?: NegativeReason }) => void;
}

export function CortexFeedback({ messageId, onSubmit }: CortexFeedbackProps) {
  const [submitted, setSubmitted] = useState<'positive' | 'negative' | null>(null);

  const handlePositive = () => {
    if (submitted) return;
    setSubmitted('positive');
    onSubmit(messageId, { rating: 'positive' });
  };

  const handleNegativeReason = (reason: NegativeReason) => {
    if (submitted) return;
    setSubmitted('negative');
    onSubmit(messageId, { rating: 'negative', reason });
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <Button
        data-testid="cortex-feedback-positive"
        variant="ghost"
        size="icon-xs"
        onClick={handlePositive}
        disabled={submitted !== null}
        className={submitted === 'positive' ? 'text-success' : 'text-muted-foreground'}
        aria-label="Helpful"
      >
        <ThumbsUp className="size-3" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="cortex-feedback-negative"
            variant="ghost"
            size="icon-xs"
            disabled={submitted !== null}
            className={submitted === 'negative' ? 'text-destructive' : 'text-muted-foreground'}
            aria-label="Not helpful"
          >
            <ThumbsDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid="cortex-feedback-reason-dropdown"
          align="start"
          sideOffset={4}
        >
          {NEGATIVE_REASONS.map((reason) => (
            <DropdownMenuItem
              key={reason}
              onClick={() => handleNegativeReason(reason)}
            >
              {reason}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
