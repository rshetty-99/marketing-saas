'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronDown, Wifi, Plane, TrendingUp, BookOpen, Heart, Users } from 'lucide-react';

interface Job {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

const JOBS: Job[] = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and scale our Next.js + Firebase platform. You will own entire features from API design to UI, working with AI integrations, real-time publishing, and cross-platform analytics.',
    requirements: ['5+ years with React/Next.js and Node.js', 'Experience with Firebase or similar cloud platforms', 'Strong TypeScript skills', 'Bonus: Experience with AI/ML integrations'],
  },
  {
    title: 'AI/ML Engineer',
    department: 'AI',
    location: 'Remote',
    type: 'Full-time',
    description: 'Develop and optimize our AI content generation pipeline, including prompt engineering, model fine-tuning, and output quality scoring. Work directly with Claude and Vertex AI.',
    requirements: ['3+ years in NLP/ML engineering', 'Experience with large language models', 'Python + TypeScript proficiency', 'Bonus: Experience with Anthropic Claude or Google Vertex AI'],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design intuitive, beautiful interfaces for complex marketing workflows. Own the design system, conduct user research, and ship pixel-perfect components using Figma and Tailwind.',
    requirements: ['4+ years product design experience', 'Strong portfolio with SaaS/B2B work', 'Proficiency in Figma', 'Bonus: Experience with design systems and Tailwind CSS'],
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Drive user acquisition and activation for the Aura platform. Build and execute growth experiments across content, paid, partnerships, and product-led channels.',
    requirements: ['3+ years in SaaS growth marketing', 'Experience with PLG and content marketing', 'Data-driven with strong analytics skills', 'Bonus: Agency or marketing tech experience'],
  },
  {
    title: 'Customer Success Lead',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Be the voice of our agency customers. Onboard new accounts, drive adoption and retention, and feed customer insights back to the product team to shape our roadmap.',
    requirements: ['3+ years in customer success at a SaaS company', 'Experience with agency or marketing clients', 'Excellent communication and empathy', 'Bonus: Technical aptitude with marketing tools'],
  },
];

const PERKS = [
  { icon: Wifi, title: 'Remote-First', description: 'Work from anywhere in the world. We\u2019re distributed across 8 time zones.' },
  { icon: Plane, title: 'Unlimited PTO', description: 'Take the time you need. We trust our team to manage their own schedules.' },
  { icon: TrendingUp, title: 'Equity', description: 'Every team member gets meaningful equity. We succeed together.' },
  { icon: BookOpen, title: 'Learning Budget', description: '$2,000/year for courses, conferences, and books. Never stop growing.' },
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
  { icon: Users, title: 'Team Retreats', description: 'Twice-yearly team gatherings in inspiring locations. Build bonds, not just code.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function CareersPage() {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center rounded-full bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 text-sm font-ui font-medium text-brand-orange mb-6"
          >
            We&apos;re hiring!
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Build the future of{' '}
            <span className="bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text text-transparent">
              marketing
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join a small, fast-moving team that&apos;s building the AI marketing platform agencies have been waiting for. Remote-first, equity-included, no bureaucracy.
          </motion.p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-label text-brand-orange mb-4 block">Open Roles</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              {JOBS.length} open positions
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {JOBS.map((job) => {
              const isExpanded = expandedJob === job.title;
              return (
                <motion.div
                  key={job.title}
                  variants={fadeUp}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedJob(isExpanded ? null : job.title)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-heading text-heading-md mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {job.department}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-border pt-4">
                          <p className="text-body-sm text-muted-foreground mb-4">{job.description}</p>
                          <h4 className="text-sm font-ui font-medium mb-2">Requirements</h4>
                          <ul className="space-y-1.5 mb-4">
                            {job.requirements.map((req) => (
                              <li key={req} className="text-body-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                          <a
                            href={`mailto:careers@aura.ai?subject=Application: ${job.title}`}
                            className="inline-flex h-9 items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-ui font-medium text-white hover:bg-brand-orange-hover transition-colors"
                          >
                            Apply now
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Perks</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Why you&apos;ll love working here
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6"
                >
                  <Icon className="w-6 h-6 text-brand-orange mb-3" />
                  <h3 className="font-heading text-heading-md mb-1">{perk.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{perk.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-label text-brand-orange mb-4 block">Culture</span>
            <h2 className="font-display font-medium tracking-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              How we work
            </h2>
            <p className="text-body-lg text-muted-foreground mb-6">
              We&apos;re a team of builders who care deeply about craft. We ship weekly, learn from our users, and hold each other to a high bar without the politics. Our culture is async-first with synchronous collaboration when it matters. We write things down, make decisions quickly, and trust each other to do great work.
            </p>
            <p className="text-body-lg text-muted-foreground">
              We believe the best marketing tools are built by people who understand marketing. That&apos;s why our team includes agency veterans, growth practitioners, and AI researchers alongside world-class engineers and designers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Don&apos;t see a role that fits?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              We&apos;re always looking for exceptional people. Send us your resume and tell us how you&apos;d make Aura better.
            </p>
            <a
              href="mailto:careers@aura.ai"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
            >
              Send your resume
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
