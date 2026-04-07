'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, MessageCircle, Send, Briefcase, Globe, Play } from 'lucide-react';

const SUBJECTS = ['General', 'Sales', 'Support', 'Partnership', 'Press'] as const;

const SOCIAL = [
  { icon: MessageCircle, href: 'https://twitter.com/aura_ai', label: 'Twitter / X' },
  { icon: Briefcase, href: 'https://linkedin.com/company/aura-ai', label: 'LinkedIn' },
  { icon: Play, href: 'https://youtube.com/@aura-ai', label: 'YouTube' },
  { icon: Globe, href: 'https://github.com/aura-ai', label: 'GitHub' },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '' as string,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  }

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
            Contact
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display font-medium tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Get in touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Have a question, want a demo, or interested in partnering? We&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Split: Form + Info */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {submitted ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-heading text-heading-lg mb-2">Message sent!</h3>
                <p className="text-body-sm text-muted-foreground mb-6">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-ui font-medium text-brand-orange hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-ui font-medium mb-2">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-ui font-medium mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-ui font-medium mb-2">Subject</label>
                  <select
                    id="subject"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select a topic</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-ui font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-heading text-heading-md mb-4">Contact information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-ui font-medium">Email</p>
                    <a href="mailto:hello@aura.ai" className="text-body-sm text-muted-foreground hover:text-brand-orange transition-colors">
                      hello@aura.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-ui font-medium">Office</p>
                    <p className="text-body-sm text-muted-foreground">
                      350 Fifth Avenue, Suite 4500<br />
                      New York, NY 10118
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-heading-md mb-4">Follow us</h3>
              <div className="flex gap-3">
                {SOCIAL.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-muted-foreground hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-border">
              <div className="relative h-56 bg-gradient-to-br from-brand-surface-100 to-brand-surface-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                  <p className="text-sm font-ui text-muted-foreground">New York City, NY</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
