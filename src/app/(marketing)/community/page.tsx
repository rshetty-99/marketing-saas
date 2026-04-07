'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Globe, AtSign, Briefcase, Users } from 'lucide-react';

const CHANNELS = [
  {
    icon: MessageCircle,
    name: 'Discord',
    description: 'Chat with other agency marketers, share workflows, and get help from the Aura team.',
    members: '2,400+',
    href: 'https://discord.gg/aura-ai',
    color: 'bg-[#5865F2]',
    border: 'hover:border-[#5865F2]/30',
  },
  {
    icon: Globe,
    name: 'GitHub',
    description: 'Report bugs, request features, and explore our open-source integrations and templates.',
    members: '850+',
    href: 'https://github.com/aura-ai',
    color: 'bg-[#24292E] dark:bg-[#F5F0EB]',
    border: 'hover:border-[#24292E]/30 dark:hover:border-[#F5F0EB]/30',
    iconClass: 'text-white dark:text-brand-void',
  },
  {
    icon: AtSign,
    name: 'Twitter / X',
    description: 'Follow us for product updates, marketing tips, and behind-the-scenes content.',
    members: '5,200+',
    href: 'https://twitter.com/aura_ai',
    color: 'bg-[#0D0D12]',
    border: 'hover:border-[#0D0D12]/30',
  },
  {
    icon: Briefcase,
    name: 'LinkedIn',
    description: 'Connect with our team, read thought leadership, and join industry discussions.',
    members: '3,800+',
    href: 'https://linkedin.com/company/aura-ai',
    color: 'bg-[#0A66C2]',
    border: 'hover:border-[#0A66C2]/30',
  },
];

const SPOTLIGHT = [
  {
    name: 'Alex Thompson',
    role: 'Founder, Prism Agency',
    initials: 'AT',
    gradient: 'from-brand-orange to-[#FF2D55]',
    quote: 'Aura cut our content production time by 60%. The AI gets our brand voice right every time.',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Head of Content, Flux Studio',
    initials: 'MG',
    gradient: 'from-brand-indigo to-[#A855F7]',
    quote: 'The multi-platform publishing and analytics saved us from juggling 5 different tools.',
  },
  {
    name: 'James Obi',
    role: 'Marketing Director, Nova Creative',
    initials: 'JO',
    gradient: 'from-[#00E5FF] to-brand-indigo',
    quote: 'Client onboarding went from 2 weeks to 2 days. The portal is exactly what we needed.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          {/* Decorative orbs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-64 h-64 rounded-full bg-brand-orange/10 blur-3xl" />
            <div className="w-48 h-48 rounded-full bg-brand-indigo/10 blur-3xl -ml-20 mt-20" />
          </div>

          <motion.div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 px-4 py-1.5 text-sm font-ui font-medium text-brand-orange mb-6"
            >
              <Users className="w-4 h-4" />
              500+ agencies
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
              className="font-display font-medium tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              Join the Aura{' '}
              <span className="bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text text-transparent">
                community
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Connect with agency marketers, share strategies, and learn from the community building the future of marketing.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Channels</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Find us everywhere
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <motion.a
                  key={channel.name}
                  variants={fadeUp}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group rounded-2xl border border-border bg-card p-8 transition-colors ${channel.border}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${channel.iconClass || 'text-white'}`} />
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{channel.members} members</span>
                  </div>
                  <h3 className="font-heading text-heading-lg mb-2 group-hover:text-brand-orange transition-colors">{channel.name}</h3>
                  <p className="text-body-sm text-muted-foreground mb-4">{channel.description}</p>
                  <span className="inline-flex items-center text-sm font-ui font-medium text-brand-orange group-hover:underline">
                    Join {channel.name}
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                Stay in the loop
              </h2>
              <p className="text-body-md text-muted-foreground mb-8 max-w-lg mx-auto">
                Get product updates, marketing tips, and community highlights delivered to your inbox. No spam, unsubscribe anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                />
                <button className="px-6 py-3 rounded-lg bg-brand-orange text-sm font-ui font-medium text-white hover:bg-brand-orange-hover transition-colors">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Spotlight */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-label text-brand-orange mb-4 block">Spotlight</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Community spotlight
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {SPOTLIGHT.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                    <span className="text-white font-display text-xs font-medium">{member.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-ui font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <p className="text-body-sm text-muted-foreground italic">&ldquo;{member.quote}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
