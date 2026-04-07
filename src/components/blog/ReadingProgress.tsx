'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(0, { stiffness: 100, damping: 30 });

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    setProgress(scrollPercent);
  }, []);

  useEffect(() => {
    scaleX.set(progress / 100);
  }, [progress, scaleX]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.div
      data-testid="reading-progress"
      className="fixed top-0 left-0 right-0 h-0.5 bg-brand-orange z-50 origin-left"
      style={{ scaleX }}
    />
  );
}
