'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQCategory {
  name: string;
  questions: { q: string; a: string }[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    name: 'Account',
    questions: [
      { q: 'How do I create an account?', a: 'Visit aura.ai/sign-up and follow the onboarding wizard. You will be asked for your name, email, organization type (freelancer, team, or agency), and basic brand information. The entire process takes about 2 minutes.' },
      { q: 'Can I change my organization type after signing up?', a: 'Yes. Go to Settings > Workspace and change your organization type. Note that downgrading from Agency to Team will disable client management features. Your data will be preserved.' },
      { q: 'How do I add team members?', a: 'Navigate to Settings > Team and click "Invite Member." Enter their email address and select a role (Admin, Manager, Editor, or Viewer). They will receive an email invitation to join your workspace.' },
      { q: 'What happens when my free trial ends?', a: 'After 15 days, your workspace enters a soft-locked state. You can still view all your content and data, but publishing, AI generation, and email campaigns are paused. Subscribe to any plan to resume full access.' },
      { q: 'How do I delete my account?', a: 'Go to Settings > Account > Danger Zone and click "Delete Account." You will have 30 days to export your data before permanent deletion. This action cannot be undone.' },
    ],
  },
  {
    name: 'Billing',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) through Stripe. For Agency plans, we also offer invoice-based billing with NET 30 terms.' },
      { q: 'Can I switch between monthly and annual billing?', a: 'Yes. Go to Settings > Billing and toggle between monthly and annual plans. Switching to annual saves 20%. If you switch mid-cycle, you will receive a prorated credit for the remaining monthly period.' },
      { q: 'How does per-seat pricing work?', a: 'Each plan includes a base number of seats. Additional seats are charged at a per-seat rate depending on your tier. You are billed for the number of active workspace members at the end of each billing cycle.' },
      { q: 'Do you offer refunds?', a: 'We do not provide refunds for partial billing periods. You may cancel at any time, and your access will continue until the end of the paid period. For annual plans, contact support to discuss options.' },
      { q: 'Is there a discount for nonprofits or education?', a: 'Yes! We offer 50% off any plan for registered nonprofits and educational institutions. Contact sales@aura.ai with your organization details to apply.' },
    ],
  },
  {
    name: 'Content',
    questions: [
      { q: 'How does AI content generation work?', a: 'Aura uses Claude AI to generate content based on your prompt, brand voice settings, and channel requirements. Enter a prompt, select the content type and target platform, and Aura generates optimized content in seconds. You can edit, regenerate, or approve the output before publishing.' },
      { q: 'What content types are supported?', a: 'Aura supports 12 content types: social posts, blog articles, email newsletters, ad copy, product descriptions, press releases, video scripts, podcast show notes, case studies, whitepapers, landing page copy, and event announcements.' },
      { q: 'Can I customize the brand voice?', a: 'Absolutely. Go to Settings > Brand Voice to configure your tone, vocabulary, audience profile, and writing style. The AI uses these settings to ensure every piece of content matches your brand identity.' },
      { q: 'How does content approval work?', a: 'Aura supports configurable multi-stage approval workflows. Freelancers get auto-approval, teams can use 2-stage (creator + reviewer), and agencies can use 3-stage (creator + manager + client) approval. Configure this in Settings > Approvals.' },
      { q: 'Who owns the AI-generated content?', a: 'You do. All content generated through Aura is owned by you. We do not use your generated content to train AI models for other customers. See our Terms of Service for full details.' },
    ],
  },
  {
    name: 'Social Media',
    questions: [
      { q: 'Which social platforms are supported?', a: 'Aura supports 8 platforms: LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube, Pinterest, and Google Business Profile. Connect them via Settings > Integrations > Social Accounts.' },
      { q: 'How do I connect a social account?', a: 'Go to Settings > Integrations, find the platform you want to connect, and click "Connect." You will be redirected to the platform to authorize Aura. All OAuth tokens are encrypted with AES-256-GCM before storage.' },
      { q: 'Can I schedule posts for different time zones?', a: 'Yes. The content calendar supports time zone-aware scheduling. Each workspace can set a default time zone, and you can override it per post. The calendar displays times in your local time zone.' },
      { q: 'What happens if publishing fails?', a: 'If a post fails to publish (e.g., expired token, API error), Aura automatically retries up to 3 times. If all retries fail, the post moves to a "Failed" state, and you receive a notification with the error details and option to retry manually.' },
      { q: 'Can I publish the same content to multiple platforms?', a: 'Yes. When creating content, select multiple target platforms. Aura automatically adapts the content for each platform (e.g., character limits for Twitter, hashtag formatting for Instagram) while maintaining your core message.' },
    ],
  },
  {
    name: 'Technical',
    questions: [
      { q: 'Is there an API available?', a: 'Yes. Aura provides a RESTful API for content generation, analytics, leads, social publishing, email campaigns, and image generation. Visit our Developer page for documentation, code examples, and rate limit details.' },
      { q: 'What security measures are in place?', a: 'Aura uses AES-256-GCM encryption for data at rest, TLS 1.3 for data in transit, Clerk authentication with MFA support, role-based access control with 14 roles, and workspace-level data isolation. See our Security page for full details.' },
      { q: 'Do you support single sign-on (SSO)?', a: 'SSO via SAML 2.0 is available on Agency plans. Contact your account manager to configure SSO with your identity provider (Okta, Azure AD, Google Workspace, etc.).' },
      { q: 'What is your uptime SLA?', a: 'We target 99.9% uptime for all paid plans. Agency plans include a formal SLA with service credits for downtime exceeding the commitment. Check our Status page for real-time system status.' },
      { q: 'Where is my data stored?', a: 'All data is stored on Google Cloud Platform (Firebase/Firestore) with primary hosting in the US. Data is encrypted at rest and in transit. For EU customers, we offer data residency options on Agency plans.' },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero with search */}
      <section className="relative py-32 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-label text-brand-orange mb-6 block"
          >
            Help Center
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-8"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
          >
            How can we help?
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors shadow-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {FAQ_DATA.map((category) => (
              <motion.div key={category.name} variants={fadeUp}>
                <h2 className="font-heading text-heading-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-orange" />
                  {category.name}
                </h2>
                <Accordion type="multiple" className="rounded-xl border border-border bg-card overflow-hidden">
                  {category.questions.map((faq, i) => (
                    <AccordionItem key={i} value={`${category.name}-${i}`} className="border-border">
                      <AccordionTrigger className="px-5 py-4 text-sm font-ui font-medium text-left hover:no-underline hover:bg-accent/50 transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4 text-body-sm text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Still need help?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Our support team is available Monday through Friday, 9am to 6pm ET. Average response time is under 2 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
            >
              Contact support
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
