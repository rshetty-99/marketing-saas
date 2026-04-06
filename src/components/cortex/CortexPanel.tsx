'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CortexContextBar } from './CortexContextBar';
import { CortexSuggestions } from './CortexSuggestions';
import { CortexInput } from './CortexInput';
import { CortexMessage } from './CortexMessage';
import { CortexDegradationBanner } from './CortexDegradationBanner';
import { CortexOnboarding, ONBOARDING_STEPS } from './CortexOnboarding';
import type { CortexMessageData } from './CortexMessage';
import type { DegradationLevel } from './CortexDegradationBanner';

interface CortexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  clientName?: string;
  brandVoice?: string;
  sessionId: string;
  onNewChat: () => void;
  degradationLevel?: DegradationLevel | null;
  showOnboarding: boolean;
  onOnboardingComplete: () => void;
}

export function CortexPanel({
  isOpen,
  onClose,
  workspaceName,
  clientName,
  brandVoice,
  sessionId,
  onNewChat,
  degradationLevel,
  showOnboarding,
  onOnboardingComplete,
}: CortexPanelProps) {
  const [messages, setMessages] = useState<CortexMessageData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const threadRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset messages when session changes
  useEffect(() => {
    setMessages([]);
  }, [sessionId]);

  const handleSend = useCallback(
    async (message: string, inputMethod: string) => {
      const userMessage: CortexMessageData = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: CortexMessageData = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch('/api/cortex/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId,
            inputMethod,
          }),
        });

        if (!response.ok || !response.body) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: 'Something went wrong. Please try again.' }
                : m
            )
          );
          setIsStreaming(false);
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
                const parsed: { type: string; content?: string; tool?: string; status?: string } = JSON.parse(data);
                if (parsed.type === 'text' && parsed.content) {
                  accumulated += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: accumulated } : m
                    )
                  );
                } else if (parsed.type === 'tool_call' && parsed.tool) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolCalls: [
                              ...(m.toolCalls ?? []),
                              { name: parsed.tool as string, status: (parsed.status as 'running' | 'complete' | 'error') ?? 'running' },
                            ],
                          }
                        : m
                    )
                  );
                }
              } catch {
                // Skip malformed SSE data
              }
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Connection error. Please try again.' }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      handleSend(suggestion, 'suggestion');
    },
    [handleSend]
  );

  const handleFeedback = useCallback(
    (_messageId: string, _feedback: { rating: 'positive' | 'negative'; reason?: string }) => {
      // Feedback handler — fires onFeedback up to parent/API
    },
    []
  );

  const handleOnboardingNext = useCallback(() => {
    if (onboardingStep >= ONBOARDING_STEPS.length - 1) {
      onOnboardingComplete();
    } else {
      setOnboardingStep((prev) => prev + 1);
    }
  }, [onboardingStep, onOnboardingComplete]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid="cortex-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed top-0 right-0 z-50 flex flex-col border-l border-border bg-card shadow-2xl ${
            isMobile ? 'inset-0' : 'h-full w-[420px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-brand-orange" />
              <span
                data-testid="cortex-session-title"
                className="text-sm font-ui font-medium"
              >
                Cortex
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                data-testid="cortex-new-chat"
                variant="ghost"
                size="icon-sm"
                onClick={onNewChat}
                aria-label="New chat"
              >
                <Plus className="size-3.5" />
              </Button>
              <Button
                data-testid="cortex-close-button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close Cortex"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Degradation Banner */}
          <AnimatePresence>
            {degradationLevel && (
              <CortexDegradationBanner level={degradationLevel} />
            )}
          </AnimatePresence>

          {/* Context Bar */}
          <CortexContextBar
            workspaceName={workspaceName}
            clientName={clientName}
            brandVoice={brandVoice}
          />

          {/* Onboarding overlay */}
          {showOnboarding && (
            <div className="relative">
              <CortexOnboarding
                step={onboardingStep}
                onComplete={handleOnboardingNext}
              />
            </div>
          )}

          {/* Message thread */}
          <div
            ref={threadRef}
            data-testid="cortex-message-thread"
            className="flex-1 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-indigo/20">
                  <MessageSquare className="size-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm font-ui font-medium">
                    How can I help?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask about your content, analytics, or schedule.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-2">
                {messages.map((msg, idx) => (
                  <CortexMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <CortexSuggestions onSelect={handleSuggestionSelect} />
          )}

          {/* Queued indicator */}
          {isStreaming && (
            <div data-testid="cortex-queued-indicator" className="px-4 py-1.5 text-xs text-muted-foreground bg-muted/50 text-center">
              Processing your previous request...
            </div>
          )}

          {/* Input */}
          <CortexInput onSubmit={handleSend} isDisabled={false} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
