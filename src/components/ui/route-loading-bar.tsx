'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global route loading bar — thin animated bar at top of viewport.
 * Activates on every client-side navigation (like YouTube/GitHub).
 * Place once in root layout.
 */
export function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(0);
  }, []);

  const completeLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  // Detect route changes
  useEffect(() => {
    completeLoading();
  }, [pathname, searchParams, completeLoading]);

  // Intercept link clicks to start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, and same-page links
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (href === pathname) return;

      startLoading();
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, startLoading]);

  // Animate progress while loading
  useEffect(() => {
    if (!loading) return;

    const steps = [
      { delay: 0, value: 15 },
      { delay: 200, value: 35 },
      { delay: 500, value: 55 },
      { delay: 1000, value: 70 },
      { delay: 2000, value: 82 },
      { delay: 4000, value: 90 },
    ];

    const timers = steps.map(({ delay, value }) =>
      setTimeout(() => {
        if (loading) setProgress(value);
      }, delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-brand-orange via-brand-indigo to-brand-orange rounded-r-full shadow-lg shadow-brand-orange/30"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Glow pulse at the tip */}
          <motion.div
            className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-brand-orange/50 to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ right: `${100 - progress}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
