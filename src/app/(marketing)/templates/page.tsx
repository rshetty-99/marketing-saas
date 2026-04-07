'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type Category = 'All' | 'Content Calendar' | 'Social Strategy' | 'Email Sequence' | 'Report' | 'Automation';

interface Template {
  title: string;
  category: Exclude<Category, 'All'>;
  description: string;
  gradient: string;
}

const TEMPLATES: Template[] = [
  { title: '30-Day Content Calendar', category: 'Content Calendar', description: 'A month of daily content prompts across all channels.', gradient: 'from-brand-orange to-[#FF2D55]' },
  { title: 'Product Launch Calendar', category: 'Content Calendar', description: 'Pre-launch, launch day, and post-launch content plan.', gradient: 'from-[#FF2D55] to-brand-orange' },
  { title: 'Instagram Growth Strategy', category: 'Social Strategy', description: 'Reels, carousels, and stories strategy for follower growth.', gradient: 'from-brand-indigo to-[#A855F7]' },
  { title: 'LinkedIn B2B Playbook', category: 'Social Strategy', description: 'Thought leadership and lead gen strategy for LinkedIn.', gradient: 'from-[#A855F7] to-brand-indigo' },
  { title: 'Welcome Email Sequence', category: 'Email Sequence', description: '5-email onboarding sequence for new subscribers.', gradient: 'from-[#00E5FF] to-brand-indigo' },
  { title: 'Re-engagement Campaign', category: 'Email Sequence', description: 'Win back inactive subscribers with a 3-email series.', gradient: 'from-brand-indigo to-[#00E5FF]' },
  { title: 'Monthly Analytics Report', category: 'Report', description: 'Cross-platform performance summary for client reporting.', gradient: 'from-[#BFFF00] to-[#00E5FF]' },
  { title: 'ROI Dashboard Template', category: 'Report', description: 'Track spend, conversions, and ROI across all channels.', gradient: 'from-[#00E5FF] to-[#BFFF00]' },
  { title: 'Content Approval Workflow', category: 'Automation', description: 'Automated routing from creation to approval to publish.', gradient: 'from-[#FF2D55] to-[#A855F7]' },
  { title: 'Social Listening Alerts', category: 'Automation', description: 'Auto-detect brand mentions and sentiment shifts.', gradient: 'from-[#A855F7] to-[#FF2D55]' },
  { title: 'Holiday Content Calendar', category: 'Content Calendar', description: 'Full-year holiday and awareness day content plan.', gradient: 'from-brand-orange to-brand-indigo' },
  { title: 'Lead Nurture Email Flow', category: 'Email Sequence', description: '7-email drip sequence from lead to customer.', gradient: 'from-brand-indigo to-brand-orange' },
];

const CATEGORIES: Category[] = ['All', 'Content Calendar', 'Social Strategy', 'Email Sequence', 'Report', 'Automation'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-label text-brand-orange mb-6 block"
          >
            Templates
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Start with a template
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Pre-built templates for content calendars, social strategies, email sequences, reports, and automations. Customize them to fit your brand.
          </motion.p>
        </div>
      </section>

      {/* Filter tabs + Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-orange text-white'
                    : 'bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Template grid */}
          <motion.div
            key={activeCategory}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((template) => (
              <motion.div
                key={template.title}
                variants={fadeUp}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-brand-orange/30 transition-colors"
              >
                {/* Gradient thumbnail */}
                <div className={`h-36 bg-gradient-to-br ${template.gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-ui font-medium text-muted-foreground">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-heading-md mb-1 group-hover:text-brand-orange transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground mb-4">{template.description}</p>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-orange px-4 text-sm font-ui font-medium text-white hover:bg-brand-orange-hover transition-colors"
                  >
                    Use Template
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
