'use client';

import { Badge } from '@/components/ui/badge';

interface CortexContextBarProps {
  workspaceName: string;
  clientName?: string;
  brandVoice?: string;
}

export function CortexContextBar({
  workspaceName,
  clientName,
  brandVoice,
}: CortexContextBarProps) {
  return (
    <div
      data-testid="cortex-context-bar"
      className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-ui"
    >
      <Badge variant="outline" className="truncate max-w-[120px]">
        {workspaceName}
      </Badge>
      {clientName && (
        <Badge variant="secondary" className="truncate max-w-[120px]">
          {clientName}
        </Badge>
      )}
      {brandVoice && (
        <Badge variant="ghost" className="truncate max-w-[100px] text-muted-foreground">
          {brandVoice}
        </Badge>
      )}
    </div>
  );
}
