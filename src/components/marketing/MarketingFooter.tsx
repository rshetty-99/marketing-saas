'use client';

import Link from 'next/link';
import { Globe, MessageCircle, Briefcase, Play } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'API', href: '/developer' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Status', href: '/status' },
    { label: 'Community', href: '/community' },
    { label: 'Templates', href: '/templates' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'DPA', href: '/dpa' },
  ],
};

const SOCIAL = [
  { icon: MessageCircle, href: 'https://twitter.com/aura_ai', label: 'Twitter' },
  { icon: Briefcase, href: 'https://linkedin.com/company/aura-ai', label: 'LinkedIn' },
  { icon: Play, href: 'https://youtube.com/@aura-ai', label: 'YouTube' },
  { icon: Globe, href: 'https://github.com/aura-ai', label: 'GitHub' },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border bg-brand-void text-brand-ghost">
      {/* Watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 font-display font-medium text-[20rem] leading-none text-white/[0.02] whitespace-nowrap select-none">
          Aura
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 19h20L12 2z" className="text-brand-void" />
                </svg>
              </div>
              <span className="font-display text-lg font-medium text-brand-ghost">Aura</span>
            </Link>
            <p className="mt-4 text-sm text-brand-muted leading-relaxed max-w-[200px]">
              Every brand deserves a halo. AI-powered marketing for agencies.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-ui font-medium text-brand-muted uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-brand-ghost/60 hover:text-brand-orange transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-brand-surface-200 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-ui font-medium text-brand-ghost">Stay in the loop</h4>
              <p className="text-xs text-brand-muted mt-1">Get product updates and marketing tips. No spam.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-brand-surface-100 border border-brand-surface-200 text-sm text-brand-ghost placeholder-brand-muted focus:outline-none focus:border-brand-orange/50 transition-colors"
              />
              <button className="px-5 py-2.5 rounded-lg bg-brand-orange text-brand-void text-sm font-ui font-medium hover:bg-brand-orange-hover transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-brand-surface-200">
          <p className="text-xs text-brand-muted">
            &copy; 2026 Aura.ai — Every brand deserves a halo.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-brand-muted hover:text-brand-orange transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
            <span className="ml-2 text-[10px] font-mono text-brand-muted/50 px-2 py-1 rounded border border-brand-surface-200">
              Built with AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
