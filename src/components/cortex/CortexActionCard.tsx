'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, Loader2, Shield } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  toolName: string;
  args: Record<string, unknown>;
  confirmationType: 'confirm_once' | 'always_confirm';
  onApprove: () => void;
  onReject: () => void;
  isExecuting: boolean;
}

export function CortexActionCard({
  title,
  description,
  toolName,
  args,
  confirmationType,
  onApprove,
  onReject,
  isExecuting,
}: ActionCardProps) {
  const [decided, setDecided] = useState(false);

  const isHighRisk = confirmationType === 'always_confirm';

  function handleApprove() {
    setDecided(true);
    onApprove();
  }

  function handleReject() {
    setDecided(true);
    onReject();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid="cortex-action-card"
      className={`rounded-xl border p-4 ${
        isHighRisk
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-brand-orange/30 bg-brand-orange/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
          isHighRisk ? 'bg-destructive/10' : 'bg-brand-orange/10'
        }`}>
          {isHighRisk ? (
            <AlertTriangle className="size-4 text-destructive" />
          ) : (
            <Shield className="size-4 text-brand-orange" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-ui text-sm font-medium">{title}</p>
            <Badge variant="outline" className="text-[10px]">
              {isHighRisk ? 'Requires approval' : 'Confirm action'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>

          {/* Show key args */}
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(args).slice(0, 4).map(([key, value]) => (
              value ? (
                <Badge key={key} variant="outline" className="text-[9px] font-mono">
                  {key}: {String(value).slice(0, 30)}{String(value).length > 30 ? '...' : ''}
                </Badge>
              ) : null
            ))}
          </div>

          {!decided ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isExecuting}
                className="bg-brand-orange text-white hover:bg-brand-orange-hover gap-1.5"
              >
                {isExecuting ? (
                  <><Loader2 className="size-3 animate-spin" />Executing...</>
                ) : (
                  <><Check className="size-3" />Approve</>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isExecuting}
                className="gap-1.5"
              >
                <X className="size-3" />Reject
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {isExecuting ? 'Executing...' : 'Action processed'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
