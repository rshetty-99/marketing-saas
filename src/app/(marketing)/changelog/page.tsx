'use client';

import { motion } from 'framer-motion';

type TagType = 'New' | 'Improvement' | 'Fix';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  features: string[];
  tags: TagType[];
  color: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    version: 'v2.0.0',
    date: 'April 2026',
    title: 'Aura Cortex \u2014 AI Command Center',
    features: [
      'Cortex AI with 14 tools: content, SEO, email, images, analytics, and more',
      'Voice input with real-time transcription',
      'SSE streaming for instant AI responses',
      'Context-aware suggestions based on workspace data',
      'Natural language commands for any platform action',
    ],
    tags: ['New'],
    color: 'from-brand-orange to-[#FF2D55]',
  },
  {
    version: 'v1.6.0',
    date: 'March 2026',
    title: 'Marketing Tools Suite',
    features: [
      'A/B testing for content and email campaigns',
      'Link shortener with UTM tracking and click analytics',
      'Influencer discovery and campaign management',
      'Ad campaign manager for Meta, Google, and LinkedIn',
      'Workflow automation builder with triggers and actions',
      'Content benchmarking against industry averages',
      'RSS feed auto-posting',
      'AI-powered reply suggestions and hashtag research',
      'Bulk scheduling, snippets library, and lead scoring',
    ],
    tags: ['New'],
    color: 'from-brand-indigo to-[#A855F7]',
  },
  {
    version: 'v1.5.0',
    date: 'March 2026',
    title: 'Admin Panel + Platform Polish',
    features: [
      '10-page admin panel with platform analytics',
      '14 roles across workspace, platform, and client portal scopes',
      'Tier gating enforcement with upgrade prompts',
      'Client portal with branded login and limited access',
      'Approval configuration per workspace',
      'Automated reports and export functionality',
    ],
    tags: ['New', 'Improvement'],
    color: 'from-[#00E5FF] to-brand-indigo',
  },
  {
    version: 'v1.4.0',
    date: 'March 2026',
    title: 'Agency Mode',
    features: [
      'Client management with onboarding wizard and bulk social connection',
      'Lead management with embeddable forms, scoring, and CRM pipeline',
      'Stripe billing integration with per-seat pricing',
      'Client-scoped content, analytics, and social connections',
      'Agency dashboard with cross-client overview',
    ],
    tags: ['New'],
    color: 'from-[#FF2D55] to-brand-orange',
  },
  {
    version: 'v1.3.0',
    date: 'February 2026',
    title: 'Growth Features',
    features: [
      'Real-time on-page SEO scorer with 8 ranking factors',
      'Keyword research with difficulty scoring and SERP analysis',
      'Template-based email editor with 8 pre-built templates',
      'Email subscriber management with segmentation',
      'AI image generation with brand color injection',
      'Dimension presets for every social platform',
    ],
    tags: ['New'],
    color: 'from-[#BFFF00] to-[#00E5FF]',
  },
  {
    version: 'v1.2.0',
    date: 'February 2026',
    title: 'Social Connections + Analytics',
    features: [
      'OAuth integration for 8 platforms: LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube, Pinterest, Google Business',
      'Cross-platform analytics dashboard with Recharts',
      'Daily analytics snapshots and trend visualization',
      'Client switcher for agency multi-client analytics',
      'AES-256-GCM token encryption for all social connections',
    ],
    tags: ['New', 'Improvement'],
    color: 'from-[#A855F7] to-[#FF2D55]',
  },
  {
    version: 'v1.1.0',
    date: 'January 2026',
    title: 'Content Pipeline',
    features: [
      'AI content generation with Claude (12 types, 10 channels)',
      'Content repurposing across platforms',
      'Visual content calendar with drag-and-drop',
      'Multi-stage approval workflows (configurable per workspace)',
      '8-state content lifecycle with full audit trail',
      'Markdown editor with live preview',
    ],
    tags: ['New'],
    color: 'from-brand-orange to-brand-indigo',
  },
  {
    version: 'v1.0.0',
    date: 'January 2026',
    title: 'Platform Launch',
    features: [
      'Clerk authentication with MFA support',
      'Multi-step onboarding wizard',
      'RBAC with workspace, platform, and portal scopes',
      'Dashboard with workspace overview',
      'Entity data model with brand voice profiles',
      'Workspace management with team invitations',
    ],
    tags: ['New'],
    color: 'from-brand-indigo to-brand-orange',
  },
];

function TagBadge({ tag }: { tag: TagType }) {
  const colors: Record<TagType, string> = {
    New: 'bg-brand-orange/10 text-brand-orange',
    Improvement: 'bg-brand-indigo/10 text-brand-indigo',
    Fix: 'bg-green-500/10 text-green-600 dark:text-green-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-ui font-medium ${colors[tag]}`}>
      {tag}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-label text-brand-orange mb-6 block"
          >
            Changelog
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            What&apos;s new in Aura
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A complete history of every feature, improvement, and fix shipped to the platform.
          </motion.p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-[17px] md:left-[19px] top-0 bottom-0 w-px bg-border" />

          {ENTRIES.map((entry, i) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative pl-12 md:pl-14 pb-16 last:pb-0"
            >
              {/* Dot */}
              <div className={`absolute left-[10px] md:left-[12px] top-1 w-[15px] h-[15px] md:w-[15px] md:h-[15px] rounded-full bg-gradient-to-br ${entry.color} border-2 border-background`} />

              {/* Version badge */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${entry.color} px-3 py-1 text-xs font-mono font-medium text-white`}>
                  {entry.version}
                </span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                {entry.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>

              <h3 className="font-heading text-heading-lg mb-3">{entry.title}</h3>

              <ul className="space-y-2">
                {entry.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-body-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
