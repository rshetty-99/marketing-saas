'use client';

import { motion } from 'framer-motion';

export function CtaBanner() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-indigo to-[#00E5FF]" />
          <div className="absolute inset-0 bg-brand-void/40" />

          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl p-[1px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-orange via-[#A855F7] to-[#00E5FF] opacity-50" />
          </div>

          {/* Content */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 px-8 md:px-16 py-16 text-center"
          >
            <h2 className="font-display font-medium text-white tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              Ready to 10x your marketing output?
            </h2>
            <p className="mt-4 text-white/70 text-body-md max-w-xl mx-auto">
              Start your 15-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full sm:flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-sm font-ui focus:outline-none focus:border-white/50 transition-colors"
              />
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-brand-void text-sm font-ui font-medium hover:bg-white/90 transition-colors whitespace-nowrap shadow-xl">
                Get Started
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
