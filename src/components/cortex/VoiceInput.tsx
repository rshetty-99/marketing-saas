'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Minimal Web Speech API types (not in all TS lib bundles) */
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing';

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  );
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const handleToggle = useCallback(() => {
    if (state === 'listening') {
      recognitionRef.current?.stop();
      setState('idle');
      return;
    }

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState('processing');
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onTranscript(transcript);
      }
      setState('idle');
    };

    recognition.onerror = () => {
      setState('idle');
    };

    recognition.onend = () => {
      setState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [state, onTranscript]);

  if (!supported) return null;

  return (
    <motion.div
      animate={
        state === 'listening'
          ? { scale: [1, 1.15, 1] }
          : undefined
      }
      transition={
        state === 'listening'
          ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <Button
        data-testid="cortex-mic-button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={
          state === 'listening'
            ? 'text-brand-orange'
            : state === 'processing'
              ? 'text-brand-indigo'
              : 'text-muted-foreground'
        }
        aria-label={state === 'listening' ? 'Stop listening' : 'Start voice input'}
      >
        <Mic className="size-4" />
      </Button>
    </motion.div>
  );
}
