'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    description: 'For freelancers and solo creators',
    monthlyPrice: 49,
    annualPrice: 39,
    features: ['1 workspace', '5 social accounts', 'AI content generation', 'Content calendar', 'Basic analytics', '100 leads/month', 'Email support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    description: 'For growing teams and small agencies',
    monthlyPrice: 149,
    annualPrice: 119,
    features: ['5 workspaces', '20 social accounts', 'Full AI suite + SEO', 'Multi-stage approvals', 'Advanced analytics + reports', '500 leads/month', 'Email campaigns', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Agency',
    description: 'For agencies managing multiple clients',
    monthlyPrice: 399,
    annualPrice: 319,
    features: ['Unlimited workspaces', 'Unlimited social accounts', 'White-label branding', 'Client portal', 'Custom dashboards', 'Unlimited leads', 'API access', 'Dedicated success manager'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 px-4 gradient-mesh" style={{ scrollMarginTop: '80px' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-label text-brand-orange mb-4 block">Pricing</span>
          <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-body-md text-muted-foreground max-w-xl mx-auto">
            Start free for 15 days. No credit card required. Upgrade when you&apos;re ready.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-ui ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-brand-orange' : 'bg-muted'}`}
            >
              <motion.div
                animate={{ x: annual ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
            <span className={`text-sm font-ui ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <span className="ml-1.5 text-[10px] font-medium text-[#BFFF00] bg-[#BFFF00]/10 px-1.5 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl border p-8 ${
                tier.popular
                  ? 'border-brand-orange bg-card shadow-xl shadow-brand-orange/10'
                  : 'border-border bg-card/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-[10px] font-ui font-medium text-white bg-gradient-to-r from-brand-orange to-brand-indigo shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="font-heading text-heading-lg">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <motion.span
                  key={annual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-4xl font-medium"
                >
                  ${annual ? tier.annualPrice : tier.monthlyPrice}
                </motion.span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              <button className={`mt-6 w-full py-3 rounded-xl text-sm font-ui font-medium transition-all ${
                tier.popular
                  ? 'text-white bg-gradient-to-r from-brand-orange to-brand-indigo hover:opacity-90 shadow-lg shadow-brand-orange/20'
                  : 'text-foreground border border-border hover:bg-muted'
              }`}>
                {tier.cta}
              </button>

              <ul className="mt-8 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
