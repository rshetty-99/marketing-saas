'use client';

import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceInput } from './VoiceInput';

interface CortexInputProps {
  onSubmit: (message: string, inputMethod: string) => void;
  isDisabled: boolean;
  placeholder?: string;
}

export function CortexInput({
  onSubmit,
  isDisabled,
  placeholder = 'Ask Cortex anything...',
}: CortexInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (inputMethod: string) => {
      const trimmed = value.trim();
      if (!trimmed || isDisabled) return;
      onSubmit(trimmed, inputMethod);
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    [value, isDisabled, onSubmit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit('keyboard');
    }
  };

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (isDisabled) return;
      onSubmit(text, 'voice');
    },
    [isDisabled, onSubmit]
  );

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      data-testid="cortex-input"
      className="flex items-end gap-2 border-t border-border px-4 py-3"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        className="flex-1 resize-none rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
        data-testid="cortex-input-textarea"
      />
      <VoiceInput onTranscript={handleVoiceTranscript} />
      <Button
        data-testid="cortex-input-send"
        variant="default"
        size="icon"
        onClick={() => handleSubmit('click')}
        disabled={isDisabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
