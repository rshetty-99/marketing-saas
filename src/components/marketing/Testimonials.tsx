'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
  { quote: "Aura replaced 6 tools for us. Our team went from 4 hours of scheduling to 20 minutes. The AI content is scarily good.", name: "Sarah Chen", role: "CEO", company: "Bloom Digital", accent: 'border-brand-orange/30' },
  { quote: "The white-label reports alone justified the cost. Our clients think we have a custom analytics platform.", name: "Marcus Rivera", role: "VP Marketing", company: "Nexus Growth", accent: 'border-brand-indigo/30' },
  { quote: "We onboarded 15 new clients in a month without hiring anyone. Aura's AI handles the heavy lifting.", name: "Emily Park", role: "Founder", company: "Stellar Agency", accent: 'border-[#00E5FF]/30' },
  { quote: "The approval workflow saved our agency from publishing disasters. Three-stage review with AI flagging — chef's kiss.", name: "David Okafor", role: "Creative Director", company: "Apex Creative", accent: 'border-[#A855F7]/30' },
  { quote: "I'm a solo freelancer managing 12 clients. Without Aura, I'd need to clone myself. The bulk scheduling is a lifesaver.", name: "Priya Sharma", role: "Freelance Strategist", company: "Independent", accent: 'border-[#FF2D55]/30' },
  { quote: "The SEO scoring in the content editor means every post is optimized before it goes live. Our organic reach doubled.", name: "James Liu", role: "Head of Content", company: "Orbit Media", accent: 'border-[#BFFF00]/30' },
  { quote: "We switched from HubSpot + Hootsuite + Canva to just Aura. $800/month in savings and a better workflow.", name: "Ana Torres", role: "Operations Manager", company: "Crest Marketing", accent: 'border-brand-orange/30' },
  { quote: "The client portal is what sealed the deal. Our clients log in, see their reports, approve content — all branded as us.", name: "Tom Nakamura", role: "Agency Owner", company: "Pulse Agency", accent: 'border-brand-indigo/30' },
];

export function Testimonials() {
  return (
    <section className="relative py-24 px-4 gradient-mesh-dual gradient-mesh">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-label text-[#A855F7] mb-4 block">Testimonials</span>
          <h2 className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Agencies love Aura
          </h2>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`break-inside-avoid rounded-2xl border ${t.accent} bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-colors`}
            >
              <p className="text-body-sm text-foreground/90 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-indigo flex items-center justify-center text-white text-xs font-display font-medium">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-ui font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
