'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CortexFloatingButtonProps {
  onOpen: () => void;
}

export function CortexFloatingButton({ onOpen }: CortexFloatingButtonProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        data-testid="cortex-floating-button"
        onClick={onOpen}
        className="size-12 rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo text-white shadow-lg hover:shadow-xl hover:from-brand-orange-hover hover:to-brand-indigo-hover border-none"
        size="icon-lg"
        aria-label="Open Cortex AI assistant"
      >
        <Sparkles className="size-5" />
      </Button>
    </motion.div>
  );
}
