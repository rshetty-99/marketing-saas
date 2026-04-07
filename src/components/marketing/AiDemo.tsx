'use client';

import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PROMPT = 'Write a LinkedIn post about launching our new AI marketing platform...';
const RESPONSE = `🚀 Exciting news! After 18 months of building, we're thrilled to launch Aura — the AI marketing platform that's changing how agencies work.

Here's what makes it different:
→ 36 AI skills that generate on-brand content in seconds
→ Publish to 8 platforms with one click
→ Real-time analytics across all channels
→ White-label reports your clients will love

We built Aura because we were tired of juggling 15 different tools. Now it's one platform, one workflow, zero context switching.

Try it free for 15 days. No credit card needed.

#MarketingAutomation #AIMarketing #AgencyLife #ContentCreation`;

export function AiDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-200px' });
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [phase, setPhase] = useState<'idle' | 'prompt' | 'response'>('idle');

  useEffect(() => {
    if (!isInView) return;
    setPhase('prompt');
  }, [isInView]);

  useEffect(() => {
    if (phase !== 'prompt') return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < PROMPT.length) {
        setDisplayedPrompt(PROMPT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('response'), 600);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'response') return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < RESPONSE.length) {
        setDisplayedResponse(RESPONSE.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <section ref={ref} className="relative py-24 px-4 gradient-mesh">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#00E5FF] mb-4 block">Live Demo</span>
          <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            See AI in action
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Prompt side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground">prompt</span>
            </div>
            <div className="p-6 font-mono text-sm min-h-[120px]">
              <span className="text-brand-orange">{'> '}</span>
              <span className="text-foreground">{displayedPrompt}</span>
              {phase === 'prompt' && <span className="inline-block w-2 h-4 bg-brand-orange ml-0.5 animate-pulse" />}
            </div>
          </motion.div>

          {/* Response side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#0A66C2] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">in</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">LinkedIn Post</span>
              </div>
              {phase === 'response' && (
                <span className="text-[10px] font-mono text-[#BFFF00]">● generating</span>
              )}
            </div>
            <div className="p-6 text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed">
              <span className="text-foreground/90">{displayedResponse}</span>
              {phase === 'response' && displayedResponse.length < RESPONSE.length && (
                <span className="inline-block w-2 h-4 bg-[#00E5FF] ml-0.5 animate-pulse" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
