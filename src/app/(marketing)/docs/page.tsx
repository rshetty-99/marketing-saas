'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Rocket, Sparkles, BarChart3, Search, Code2, Users, Palette, ChevronRight, Menu, X } from 'lucide-react';

interface DocSection {
  title: string;
  items: { label: string; href: string }[];
}

const SIDEBAR_SECTIONS: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Quick Start', href: '/docs' },
      { label: 'Installation', href: '/docs' },
      { label: 'Configuration', href: '/docs' },
    ],
  },
  {
    title: 'Features',
    items: [
      { label: 'Content Generation', href: '/docs' },
      { label: 'Publishing', href: '/docs' },
      { label: 'Analytics', href: '/docs' },
      { label: 'SEO', href: '/docs' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Authentication', href: '/docs' },
      { label: 'Endpoints', href: '/docs' },
      { label: 'Webhooks', href: '/docs' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { label: 'Agency Setup', href: '/docs' },
      { label: 'Client Onboarding', href: '/docs' },
      { label: 'White-Label', href: '/docs' },
    ],
  },
];

const QUICK_LINKS = [
  { icon: Rocket, title: 'Quick Start', description: 'Get up and running in 5 minutes with our step-by-step guide.', href: '/docs', color: 'from-brand-orange to-[#FF2D55]' },
  { icon: Sparkles, title: 'AI Content', description: 'Learn how to generate on-brand content with Claude AI across 12 content types.', href: '/docs', color: 'from-brand-indigo to-[#A855F7]' },
  { icon: BarChart3, title: 'Analytics', description: 'Set up cross-platform analytics and automated client reports.', href: '/docs', color: 'from-[#00E5FF] to-brand-indigo' },
  { icon: Search, title: 'SEO Tools', description: 'Configure real-time SEO scoring and keyword research for your content.', href: '/docs', color: 'from-[#BFFF00] to-[#00E5FF]' },
  { icon: Code2, title: 'API Reference', description: 'Integrate Aura into your apps with our RESTful API and webhooks.', href: '/developer', color: 'from-[#FF2D55] to-brand-orange' },
  { icon: Users, title: 'Client Management', description: 'Onboard clients, manage permissions, and set up branded portals.', href: '/docs', color: 'from-[#A855F7] to-[#FF2D55]' },
  { icon: Palette, title: 'White-Label', description: 'Customize branding, colors, and domain for your agency\u2019s portal.', href: '/docs', color: 'from-brand-orange to-brand-indigo' },
  { icon: BookOpen, title: 'Best Practices', description: 'Tips and patterns for getting the most out of the Aura platform.', href: '/docs', color: 'from-brand-indigo to-[#00E5FF]' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex gap-12">
          {/* Sidebar — Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.title} className="mb-6">
                  <p className="text-label text-muted-foreground mb-3">{section.title}</p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="block px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-brand-orange text-white shadow-lg"
            aria-label="Toggle documentation sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
              <nav
                className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {SIDEBAR_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-6">
                    <p className="text-label text-muted-foreground mb-3">{section.title}</p>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className="block px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <span className="text-label text-brand-orange mb-4 block">Documentation</span>
              <h1 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Welcome to Aura Docs
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl">
                Everything you need to set up, configure, and get the most out of the Aura marketing platform. From quick start guides to advanced API integrations.
              </p>
            </motion.div>

            {/* Quick links grid */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.div key={link.title} variants={fadeUp}>
                    <Link
                      href={link.href}
                      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-brand-orange/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-sm font-medium group-hover:text-brand-orange transition-colors">{link.title}</h3>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
