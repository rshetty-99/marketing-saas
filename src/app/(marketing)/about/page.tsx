'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Cpu, Lock, Rocket } from 'lucide-react';

const TEAM = [
  { name: 'Rajesh Shetty', role: 'CEO & Founder', initials: 'RS', gradient: 'from-brand-orange to-[#FF2D55]', bio: 'Former agency director who built Aura to solve the problems he lived every day. Obsessed with shipping fast and listening to customers.' },
  { name: 'Sarah Chen', role: 'CTO', initials: 'SC', gradient: 'from-brand-indigo to-[#A855F7]', bio: 'Ex-Google Cloud engineer with 12 years building scalable SaaS platforms. Leads our engineering team from architecture to deployment.' },
  { name: 'Marcus Rivera', role: 'VP Design', initials: 'MR', gradient: 'from-[#00E5FF] to-brand-indigo', bio: 'Previously led design at two YC-backed startups. Believes great tools should feel invisible and let creativity flow.' },
  { name: 'Emily Park', role: 'VP Marketing', initials: 'EP', gradient: 'from-[#FF2D55] to-brand-orange', bio: 'Ran marketing for a top-20 agency before joining Aura. Brings the practitioner perspective to everything we build.' },
  { name: 'David Okafor', role: 'Head of AI', initials: 'DO', gradient: 'from-[#BFFF00] to-[#00E5FF]', bio: 'PhD in NLP from Stanford. Spent 5 years at Anthropic before bringing responsible AI to the marketing industry.' },
  { name: 'Priya Sharma', role: 'Head of Growth', initials: 'PS', gradient: 'from-[#A855F7] to-[#FF2D55]', bio: 'Growth leader who scaled two SaaS platforms from 0 to $10M ARR. Data-driven, customer-obsessed, and always experimenting.' },
];

const VALUES = [
  { icon: Shield, title: 'Agency-First', description: 'Built by agency people, for agency people. Every feature is designed for the multi-client, multi-channel reality of agency work.' },
  { icon: Cpu, title: 'AI with Guardrails', description: 'AI should amplify creativity, not replace it. Every AI output goes through human review. Brand voice is always respected.' },
  { icon: Lock, title: 'Privacy by Design', description: 'Workspace isolation, encrypted tokens, RBAC at every layer. Your data and your clients\' data are never mixed or exposed.' },
  { icon: Rocket, title: 'Ship Fast, Ship Often', description: 'Weekly releases, transparent changelog, and a bias for action. We\u2019d rather ship and iterate than wait for perfect.' },
];

const MILESTONES = [
  { year: '2024', title: 'Founded', description: 'Aura Technologies Inc. founded in New York City with a mission to give every brand a halo.' },
  { year: '2025', title: 'Beta Launch', description: 'Launched the beta platform with AI content generation, multi-platform publishing, and analytics.' },
  { year: '2025', title: '100 Agencies', description: 'Reached 100 active agencies on the platform, managing over 500 client brands.' },
  { year: '2026', title: '500 Agencies', description: 'Crossed 500 agencies with full feature suite including SEO, email, lead gen, and client portals.' },
  { year: '2026', title: 'Cortex AI Launch', description: 'Launched Aura Cortex \u2014 the AI command center with 14 tools, voice input, and real-time streaming.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
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
            About Aura
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Every brand deserves{' '}
            <span className="bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text text-transparent">
              a halo.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Aura is the AI-powered marketing platform built for agencies that move fast. We help teams generate on-brand content, publish across every channel, and prove ROI \u2014 all from one place.
          </motion.p>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Team</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              The people behind the platform
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                whileHover={{ y: -4, rotateY: 2, rotateX: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                style={{ perspective: '1000px' }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4`}>
                  <span className="text-white font-display font-medium text-lg">{member.initials}</span>
                </div>
                <h3 className="font-heading text-heading-md mb-1">{member.name}</h3>
                <p className="text-sm font-ui text-brand-orange mb-3">{member.role}</p>
                <p className="text-body-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Values</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              What we believe
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-indigo flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading text-heading-md mb-2">{value.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Timeline</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Our journey so far
            </h2>
          </motion.div>

          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {MILESTONES.map((milestone, i) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className={`relative flex items-start gap-6 mb-12 pl-12 md:pl-0 ${
                  i % 2 === 0 ? 'md:pr-[calc(50%+2rem)] md:text-right' : 'md:pl-[calc(50%+2rem)]'
                }`}
              >
                {/* Dot */}
                <div className={`absolute top-1.5 w-3 h-3 rounded-full bg-brand-orange border-2 border-background left-[10px] md:left-1/2 md:-translate-x-1/2`} />

                <div>
                  <span className="inline-flex items-center rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-ui font-medium text-brand-orange mb-2">
                    {milestone.year}
                  </span>
                  <h3 className="font-heading text-heading-md mb-1">{milestone.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Want to build the future of marketing?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              We&apos;re always looking for talented people who share our mission. Check out our open roles.
            </p>
            <Link
              href="/careers"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
            >
              View open positions
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
