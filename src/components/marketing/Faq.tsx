'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'General',
    questions: [
      { q: 'What is Aura?', a: 'Aura is an AI-powered marketing platform for agencies and freelancers managing 5-100 client accounts. It replaces 10+ tools with one platform for content creation, publishing, analytics, email, SEO, GEO, lead management, and client reporting.' },
      { q: 'How is Aura different from Hootsuite or Buffer?', a: 'Hootsuite and Buffer are scheduling tools. Aura is a complete marketing platform — it generates AI content, optimizes for SEO + GEO (AI search), manages leads, builds landing pages, creates email sequences, generates client proposals, and has an AI command center (Cortex). One platform instead of 10.' },
      { q: 'Is Aura for freelancers or agencies?', a: 'Both. Freelancers use the Starter plan ($49/mo) to manage up to 5 social accounts. Agencies use the Agency plan ($399/mo) for unlimited workspaces, white-label branding, client portal, and multi-client management.' },
      { q: 'Do I need to know AI to use Aura?', a: "No. Aura's AI works behind the scenes. Just type what you want (\"Write a LinkedIn post about our product launch\") and the AI generates it in your brand voice. You review, edit, and publish. The AI handles optimization automatically." },
    ],
  },
  {
    category: 'AI & Content',
    questions: [
      { q: 'What AI does Aura use?', a: 'Claude by Anthropic — one of the most capable AI models for content generation, with exceptional performance on brand voice matching, tone consistency, and factual accuracy.' },
      { q: 'Will AI-generated content sound robotic?', a: 'No. Aura learns your brand voice — tone, formality, personality, target audience — and generates content that sounds like you wrote it. You can test this with the "Generate Sample" tool in Brand Voice settings before publishing anything.' },
      { q: 'What is the autoresearch feature?', a: 'Inspired by Karpathy\'s autoresearch algorithm. When AI generates content, it automatically scores it across SEO, GEO, readability, and brand voice, then rewrites to improve the score. You get higher quality content without manual editing — typically 2-3 iterations to hit 80+ quality score.' },
      { q: 'What is GEO and why do I need it?', a: 'GEO (Generative Engine Optimization) optimizes your content to be cited by AI search engines like ChatGPT, Perplexity, Claude, and Google AI Overviews. 25% of search now happens through AI engines. While SEO gets you ranked in Google, GEO gets you cited in AI answers. Aura scores both automatically.' },
    ],
  },
  {
    category: 'Pricing',
    questions: [
      { q: 'How much does Aura cost?', a: 'Starter: $49/mo (freelancers, 1 workspace, 5 social accounts). Growth: $149/mo (teams, 5 workspaces, full AI suite). Agency: $399/mo (unlimited workspaces, white-label, client portal). All plans include a 15-day free trial with no credit card required.' },
      { q: 'Is there a free trial?', a: 'Yes — 15 days with full features, no credit card required. Cancel anytime. You get access to everything: AI content generation, publishing, analytics, SEO, GEO, email, and lead management.' },
      { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade anytime from your billing settings. Changes take effect immediately. If you downgrade, you keep access to your data but some features become read-only.' },
    ],
  },
  {
    category: 'Integrations & Security',
    questions: [
      { q: 'Which social platforms does Aura support?', a: 'All 8 major platforms: LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube, Pinterest, and Google Business. Connect via OAuth — click "Connect", authorize on the platform, and you\'re publishing in seconds.' },
      { q: 'Does Aura integrate with my CRM?', a: 'Yes. Two-way sync with HubSpot, Salesforce, Pipedrive, GoHighLevel, and Zoho. Leads captured in Aura automatically sync to your CRM. Configuration takes 2 minutes.' },
      { q: 'Is my data secure?', a: 'Yes. OAuth tokens encrypted with AES-256-GCM. All data workspace-scoped in Firestore with strict security rules. GDPR-compliant with data subject requests, consent records, retention policies, and a public unsubscribe endpoint.' },
      { q: 'Can my clients see their own reports?', a: 'Yes, on Agency plans. Client portal at your custom domain (white-label). Clients log in, view reports, approve content, and provide feedback — all branded as your agency, not Aura.' },
    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-ui text-sm font-medium text-foreground">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-body-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [activeCategory, setActiveCategory] = useState('General');

  const categories = FAQ_ITEMS.map((c) => c.category);
  const activeQuestions = FAQ_ITEMS.find((c) => c.category === activeCategory)?.questions ?? [];

  return (
    <section className="relative py-24 px-4 gradient-mesh" style={{ scrollMarginTop: '80px' }} id="faq">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-label text-brand-orange mb-4 block">FAQ</span>
          <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Got questions?{' '}
            <span className="text-muted-foreground">We&apos;ve got answers.</span>
          </h2>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-ui transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-orange text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-6"
        >
          {activeQuestions.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
