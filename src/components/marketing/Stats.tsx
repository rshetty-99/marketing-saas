'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 12, suffix: 'M+', label: 'Posts Created', color: 'from-brand-orange to-[#FF2D55]' },
  { value: 500, suffix: '+', label: 'Agencies', color: 'from-brand-indigo to-[#A855F7]' },
  { value: 8, suffix: '', label: 'Platforms', color: 'from-[#00E5FF] to-brand-indigo' },
  { value: 99.9, suffix: '%', label: 'Uptime', color: 'from-[#BFFF00] to-[#00E5FF]' },
];

function Counter({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  const display = target === 99.9 ? count.toFixed(1) : Math.floor(count);
  return <span ref={ref}>{display}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="relative py-24 px-4">
      {/* Subtle divider gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div
                className={`font-display font-medium tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm font-ui text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
