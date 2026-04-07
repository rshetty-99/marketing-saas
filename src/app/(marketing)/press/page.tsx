'use client';

import { motion } from 'framer-motion';
import { Download, ExternalLink, Mail } from 'lucide-react';

const PRESS_COVERAGE = [
  { publication: 'TechCrunch', headline: 'Aura raises $12M Series A to bring AI-powered marketing to agencies', date: 'March 2026', url: '#' },
  { publication: 'Product Hunt', headline: '#1 Product of the Day \u2014 Aura: AI marketing co-pilot for agencies', date: 'February 2026', url: '#' },
  { publication: 'Forbes', headline: '10 AI tools transforming how agencies work in 2026', date: 'January 2026', url: '#' },
  { publication: 'Marketing Week', headline: 'The platform agencies didn\u2019t know they needed \u2014 until now', date: 'December 2025', url: '#' },
];

const BRAND_COLORS = [
  { name: 'Signal Orange', hex: '#FF4D00', className: 'bg-brand-orange' },
  { name: 'Electric Indigo', hex: '#4F35F5', className: 'bg-brand-indigo' },
  { name: 'Void Black', hex: '#0D0D12', className: 'bg-brand-void' },
  { name: 'Ghost White', hex: '#F5F0EB', className: 'bg-brand-ghost border border-border' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function PressPage() {
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
            Press
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Aura in the news
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Download brand assets, read our latest coverage, or get in touch with our press team.
          </motion.p>
        </div>
      </section>

      {/* Press Kit */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-label text-brand-orange mb-4 block">Press Kit</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Brand assets
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border bg-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-heading-lg mb-2">Download our brand assets</h3>
                <p className="text-body-sm text-muted-foreground max-w-lg">
                  Logos, wordmarks, and brand guidelines in SVG, PNG, and PDF formats. Please use our assets in accordance with our brand guidelines.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-ui font-medium hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" />
                  Logo Pack (SVG)
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-ui font-medium hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" />
                  Brand Guide (PDF)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-24 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-label text-brand-orange mb-4 block">Coverage</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Media coverage
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {PRESS_COVERAGE.map((article) => (
              <motion.a
                key={article.headline}
                variants={fadeUp}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-brand-orange/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-ui font-medium">
                    {article.publication}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-orange transition-colors" />
                </div>
                <h3 className="font-heading text-heading-md mb-2 group-hover:text-brand-orange transition-colors">
                  {article.headline}
                </h3>
                <p className="text-sm text-muted-foreground">{article.date}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Colors */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-label text-brand-orange mb-4 block">Palette</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Brand colors
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {BRAND_COLORS.map((color) => (
              <motion.div key={color.name} variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`h-24 ${color.className}`} />
                <div className="p-4">
                  <h3 className="font-ui text-sm font-medium mb-1">{color.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground">{color.hex}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Mail className="w-8 h-8 text-brand-orange mx-auto mb-4" />
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Press inquiries
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              For media inquiries, interview requests, or additional assets, reach out to our press team.
            </p>
            <a
              href="mailto:press@aura.ai"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
            >
              press@aura.ai
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
