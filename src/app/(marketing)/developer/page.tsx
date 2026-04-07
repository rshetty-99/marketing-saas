'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Key, Zap, Webhook } from 'lucide-react';

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/content', description: 'Create AI-generated content', auth: 'Bearer' },
  { method: 'GET', path: '/api/v1/analytics', description: 'Retrieve cross-platform analytics', auth: 'Bearer' },
  { method: 'GET', path: '/api/v1/leads', description: 'List and filter leads', auth: 'Bearer' },
  { method: 'POST', path: '/api/v1/social/publish', description: 'Publish to social platforms', auth: 'Bearer' },
  { method: 'POST', path: '/api/v1/email/campaigns', description: 'Create and send email campaigns', auth: 'Bearer' },
  { method: 'POST', path: '/api/v1/images/generate', description: 'Generate branded images with AI', auth: 'Bearer' },
];

const RATE_LIMITS = [
  { tier: 'Starter', requests: '60 req/min', burst: '10 req/sec' },
  { tier: 'Growth', requests: '300 req/min', burst: '30 req/sec' },
  { tier: 'Agency', requests: '1,000 req/min', burst: '100 req/sec' },
];

const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.aura.ai/v1/content \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "social_post",
    "channel": "linkedin",
    "prompt": "Announce our new product launch",
    "tone": "professional",
    "brand_voice_id": "bv_abc123"
  }'`,
  node: `import Aura from '@aura-ai/sdk';

const aura = new Aura({
  apiKey: process.env.AURA_API_KEY,
});

const content = await aura.content.create({
  type: 'social_post',
  channel: 'linkedin',
  prompt: 'Announce our new product launch',
  tone: 'professional',
  brandVoiceId: 'bv_abc123',
});

console.log(content.text);`,
  python: `import aura

client = aura.Client(api_key="YOUR_API_KEY")

content = client.content.create(
    type="social_post",
    channel="linkedin",
    prompt="Announce our new product launch",
    tone="professional",
    brand_voice_id="bv_abc123",
)

print(content.text)`,
};

type CodeTab = keyof typeof CODE_EXAMPLES;

const WEBHOOK_PAYLOAD = `{
  "event": "content.published",
  "timestamp": "2026-04-05T14:30:00Z",
  "data": {
    "content_id": "cnt_xyz789",
    "type": "social_post",
    "channel": "linkedin",
    "status": "published",
    "url": "https://linkedin.com/posts/..."
  }
}`;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="rounded-xl bg-brand-void border border-brand-surface-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-surface-200">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-[10px] font-mono text-brand-muted">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-brand-ghost leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-orange flex items-center justify-center mx-auto mb-6"
          >
            <Code2 className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Build with the{' '}
            <span className="bg-gradient-to-r from-brand-orange to-brand-indigo bg-clip-text text-transparent">
              Aura API
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Integrate AI content generation, social publishing, analytics, and more into your own applications with our RESTful API.
          </motion.p>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-brand-orange" />
              <span className="text-label text-brand-orange">Authentication</span>
            </div>
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Getting started
            </h2>
            <p className="text-body-md text-muted-foreground mb-6">
              Generate an API key from your <Link href="/dashboard/developer" className="text-brand-orange hover:underline">dashboard settings</Link>. Include it as a Bearer token in the Authorization header of every request.
            </p>
            <CodeBlock
              language="HTTP Header"
              code='Authorization: Bearer aura_live_sk_abc123def456...'
            />
          </motion.div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-brand-orange" />
              <span className="text-label text-brand-orange">Endpoints</span>
            </div>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              API reference
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground">Method</th>
                    <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground">Endpoint</th>
                    <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((ep) => (
                    <motion.tr key={ep.path} variants={fadeUp} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium ${
                          ep.method === 'POST' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-indigo/10 text-brand-indigo'
                        }`}>
                          {ep.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{ep.path}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{ep.description}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-label text-brand-orange mb-4 block">Examples</span>
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Create content in 3 lines
            </h2>
          </motion.div>

          <div className="mb-4 flex gap-2">
            {(Object.keys(CODE_EXAMPLES) as CodeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-orange text-white'
                    : 'bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
              </button>
            ))}
          </div>

          <CodeBlock language={activeTab === 'curl' ? 'bash' : activeTab === 'node' ? 'javascript' : 'python'} code={CODE_EXAMPLES[activeTab]} />
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-24 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-label text-brand-orange mb-4 block">Limits</span>
            <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Rate limits
            </h2>
          </motion.div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground">Tier</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground">Requests / min</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-xs uppercase tracking-wider text-muted-foreground">Burst</th>
                </tr>
              </thead>
              <tbody>
                {RATE_LIMITS.map((rl) => (
                  <tr key={rl.tier} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-ui font-medium">{rl.tier}</td>
                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{rl.requests}</td>
                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{rl.burst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Webhook className="w-5 h-5 text-brand-orange" />
              <span className="text-label text-brand-orange">Webhooks</span>
            </div>
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Real-time event notifications
            </h2>
            <p className="text-body-md text-muted-foreground mb-6">
              Subscribe to events like content published, lead captured, or campaign completed. We send a POST request to your endpoint with the event payload.
            </p>
          </motion.div>

          <CodeBlock language="JSON payload" code={WEBHOOK_PAYLOAD} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 gradient-mesh">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Ready to build?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Get your API key and start building in minutes.
            </p>
            <Link
              href="/dashboard/developer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
            >
              Get your API key
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
