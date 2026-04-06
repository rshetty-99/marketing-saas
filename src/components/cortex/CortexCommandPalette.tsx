'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CortexInput } from './CortexInput';

interface CortexCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CortexCommandPalette({
  isOpen,
  onClose,
}: CortexCommandPaletteProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (message: string, _inputMethod: string) => {
      setIsLoading(true);
      setResult(null);

      try {
        const response = await fetch('/api/cortex/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: `cmd-${Date.now()}`,
            inputMethod: _inputMethod,
            singleShot: true,
          }),
        });

        if (!response.ok || !response.body) {
          setResult('Something went wrong. Please try again.');
          setIsLoading(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed: { type: string; content?: string } = JSON.parse(data);
                if (parsed.type === 'text' && parsed.content) {
                  accumulated += parsed.content;
                  setResult(accumulated);
                }
              } catch {
                // Skip malformed SSE data
              }
            }
          }
        }
      } catch {
        setResult('Connection error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            data-testid="cortex-command-palette-backdrop"
          />

          {/* Modal */}
          <motion.div
            data-testid="cortex-command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-[20%] left-1/2 z-[61] w-[90vw] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl"
          >
            <div data-testid="cortex-command-input">
              <CortexInput
                onSubmit={handleSubmit}
                isDisabled={isLoading}
                placeholder="Quick command..."
              />
            </div>

            {/* Result area */}
            {(isLoading || result) && (
              <div className="border-t border-border px-4 py-3">
                {isLoading && !result && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="font-ui">Thinking...</span>
                  </div>
                )}
                {result && (
                  <div className="text-sm font-body whitespace-pre-wrap break-words text-foreground">
                    {result}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
