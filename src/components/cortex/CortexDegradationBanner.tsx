'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, WifiOff, Zap } from 'lucide-react';

type DegradationLevel = 'degraded' | 'slash_only' | 'offline';

interface CortexDegradationBannerProps {
  level: DegradationLevel;
}

const BANNER_CONFIG: Record<
  DegradationLevel,
  { icon: typeof Zap; text: string; className: string }
> = {
  degraded: {
    icon: Zap,
    text: 'Using fast mode',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  slash_only: {
    icon: AlertTriangle,
    text: 'AI offline. Quick commands still work.',
    className: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
  },
  offline: {
    icon: WifiOff,
    text: 'Service unavailable',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
};

export function CortexDegradationBanner({ level }: CortexDegradationBannerProps) {
  const config = BANNER_CONFIG[level];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <motion.div
      data-testid="cortex-degradation-banner"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 border-b px-4 py-2 text-xs font-ui ${config.className}`}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{config.text}</span>
    </motion.div>
  );
}

export type { DegradationLevel };
