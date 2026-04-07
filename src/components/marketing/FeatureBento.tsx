'use client';

import { motion } from 'framer-motion';
import { Sparkles, Share2, BarChart3, Search, Mail, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate on-brand posts, articles, and campaigns in seconds with Claude AI. 12 content types, 10 channels.',
    span: 'col-span-2',
    accent: 'from-brand-orange to-[#FF2D55]',
    large: true,
  },
  {
    icon: Share2,
    title: 'Multi-Platform Publishing',
    description: 'Publish to 8 platforms with one click. Schedule, queue, or post instantly.',
    span: 'col-span-1',
    accent: 'from-brand-indigo to-[#A855F7]',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Cross-platform metrics, ROI tracking, and automated client reports.',
    span: 'col-span-1',
    accent: 'from-[#00E5FF] to-brand-indigo',
  },
  {
    icon: Search,
    title: 'SEO Intelligence',
    description: 'Real-time SEO scoring, keyword research, and competitor gap analysis.',
    span: 'col-span-1',
    accent: 'from-[#BFFF00] to-[#00E5FF]',
  },
  {
    icon: Mail,
    title: 'Email Campaigns',
    description: 'Drag-and-drop email builder with AI copy, A/B testing, and deliverability tracking.',
    span: 'col-span-1',
    accent: 'from-[#FF2D55] to-brand-orange',
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Embeddable forms, CRM pipeline, lead scoring, and enrichment.',
    span: 'col-span-1',
    accent: 'from-[#A855F7] to-[#FF2D55]',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cardVariants: any = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function FeatureBento() {
  return (
    <section id="features" className="relative py-24 px-4 gradient-mesh gradient-mesh-dual" style={{ scrollMarginTop: '80px' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-label text-brand-orange mb-4 block">Features</span>
          <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Everything you need.{' '}
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className={`group relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-transparent ${feature.span} ${feature.large ? 'md:row-span-1' : ''}`}
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                <div className="absolute inset-[1px] rounded-2xl bg-card -z-10 group-hover:bg-card/95" />

                <div className={`p-6 ${feature.large ? 'md:p-8' : 'p-6'}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading text-heading-md mb-2">{feature.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{feature.description}</p>

                  {feature.large && (
                    <div className="mt-6 rounded-xl bg-brand-surface-100 dark:bg-brand-void/50 border border-border p-4 font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                        <span className="ml-2 text-[10px] text-muted-foreground/50">AI Content Studio</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex gap-2"><span className="text-brand-orange">prompt:</span> <span className="text-foreground/70">&quot;Write a LinkedIn post about our new product launch&quot;</span></div>
                        <div className="flex gap-2"><span className="text-[#00E5FF]">tone:</span> <span className="text-foreground/70">professional, exciting</span></div>
                        <div className="flex gap-2"><span className="text-[#A855F7]">platform:</span> <span className="text-foreground/70">linkedin, twitter, instagram</span></div>
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <span className="text-[#BFFF00]">generating...</span>
                          <span className="inline-block w-1.5 h-4 bg-brand-orange/70 ml-1 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
