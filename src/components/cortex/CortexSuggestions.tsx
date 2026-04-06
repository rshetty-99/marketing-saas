'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const DEFAULT_SUGGESTIONS = [
  'Show my analytics',
  'List recent drafts',
  "What's on my calendar?",
  'Check brand mentions',
];

interface CortexSuggestionsProps {
  suggestions?: string[];
  onSelect: (suggestion: string) => void;
}

export function CortexSuggestions({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
}: CortexSuggestionsProps) {
  return (
    <div
      data-testid="cortex-suggestions"
      className="flex flex-wrap gap-2 px-4 py-3"
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-ui"
            onClick={() => onSelect(suggestion)}
            data-testid={`cortex-suggestion-${index}`}
          >
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
