'use client';

import { motion } from 'framer-motion';

const LOGOS_ROW_1 = ['Acme Corp', 'Bloom Digital', 'Nexus Growth', 'Stellar Agency', 'Orbit Media', 'Apex Creative', 'Pulse Marketing', 'Zenith Labs', 'Crest Finance', 'Nova Studio'];
const LOGOS_ROW_2 = ['Iron Peak', 'Lunar Agency', 'Prism Digital', 'Vertex Co', 'Atlas Brand', 'Onyx Media', 'Coral Studios', 'Helix Growth', 'Tide Creative', 'Summit Agency'];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 mx-6 md:mx-10 flex items-center gap-2 text-muted-foreground/40 hover:text-foreground/70 transition-colors duration-300 select-none cursor-default">
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-display font-medium">
        {name.charAt(0)}
      </div>
      <span className="text-sm font-ui font-medium whitespace-nowrap">{name}</span>
    </div>
  );
}

function TickerRow({ logos, direction, speed }: { logos: string[]; direction: 'left' | 'right'; speed: number }) {
  const doubled = [...logos, ...logos];
  return (
    <div className="relative overflow-hidden py-3">
      <div
        className="flex w-max"
        style={{
          animation: `ticker-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((name, i) => (
          <LogoItem key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}

export function LogoTicker() {
  return (
    <section className="relative py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="text-label text-muted-foreground">Trusted by 500+ agencies worldwide</span>
      </motion.div>

      <div className="relative" style={{ perspective: '1000px' }}>
        <div style={{ transform: 'rotateX(2deg)' }}>
          <TickerRow logos={LOGOS_ROW_1} direction="left" speed={40} />
          <TickerRow logos={LOGOS_ROW_2} direction="right" speed={50} />
        </div>
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

    </section>
  );
}
