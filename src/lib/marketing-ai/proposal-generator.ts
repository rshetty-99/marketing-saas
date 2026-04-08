/**
 * Client Proposal Generator
 * Input client details + services → generates branded proposal with pricing, scope, timeline.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('client_proposals');

export async function listProposals(workspaceId: string) {
  const snap = await col(workspaceId).limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function generateProposal(
  workspaceId: string,
  config: { clientName: string; clientIndustry: string; services: string[]; monthlyBudget: string; duration: string },
  createdBy: string,
) {
  const ref = col(workspaceId).doc();

  const serviceDescriptions: Record<string, { desc: string; deliverables: string[]; price: string }> = {
    social_media: { desc: 'End-to-end social media management including content creation, scheduling, community management, and monthly reporting.', deliverables: ['15 social posts/month', 'Content calendar', 'Community management', 'Monthly performance report'], price: '$1,500/mo' },
    content_creation: { desc: 'Professional content creation including blog posts, articles, email newsletters, and website copy.', deliverables: ['4 blog posts/month', '2 email newsletters/month', 'Website copy updates', 'SEO optimization'], price: '$2,000/mo' },
    seo: { desc: 'Search engine optimization including keyword research, on-page optimization, technical SEO, and link building.', deliverables: ['Keyword research & strategy', 'Monthly on-page optimization', 'Technical SEO audit', 'Link building outreach'], price: '$1,800/mo' },
    email_marketing: { desc: 'Email marketing strategy and execution including campaign design, automation sequences, and list management.', deliverables: ['4 email campaigns/month', 'Automated sequences (welcome, nurture)', 'A/B testing', 'List segmentation & hygiene'], price: '$1,200/mo' },
    paid_ads: { desc: 'Paid advertising management across Meta, Google, and LinkedIn including creative, targeting, and optimization.', deliverables: ['Ad creative design', 'Audience targeting & setup', 'Weekly optimization', 'Monthly ROI report'], price: '$2,500/mo + ad spend' },
    photography: { desc: 'Professional brand photography including product shots, lifestyle images, team headshots, and social media visuals.', deliverables: ['Monthly photoshoot (half-day)', '20 edited images', 'Social media assets', 'Brand photo library'], price: '$1,500/mo' },
    branding: { desc: 'Brand strategy and identity development including brand voice, visual identity, and brand guidelines.', deliverables: ['Brand audit', 'Brand voice guide', 'Visual identity system', 'Brand guidelines document'], price: '$5,000 (one-time)' },
  };

  const sections = [
    { title: 'Executive Summary', content: `We are excited to present this proposal for ${config.clientName}. Based on our understanding of your business in the ${config.clientIndustry} industry, we have tailored a marketing strategy designed to drive measurable growth over the next ${config.duration}.\n\nOur approach combines data-driven strategy with creative execution, ensuring every campaign delivers ROI.` },
    { title: 'Understanding Your Business', content: `${config.clientName} operates in the competitive ${config.clientIndustry} market. To stand out, you need a consistent brand presence, engaging content, and a data-informed strategy that adapts to what works.\n\nWe have identified key opportunities in content marketing, social engagement, and targeted advertising that align with your growth goals.` },
    { title: 'Our Approach', content: `Our methodology follows a proven framework:\n\n1. **Discover** — Deep-dive into your brand, audience, and competitors\n2. **Strategize** — Build a custom marketing plan with clear KPIs\n3. **Execute** — Create and publish content across chosen channels\n4. **Optimize** — Analyze performance and iterate for continuous improvement\n5. **Report** — Monthly reports with insights and recommendations` },
    { title: 'Scope of Services', content: config.services.map((s) => {
      const sd = serviceDescriptions[s];
      return sd ? `### ${s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n${sd.desc}` : '';
    }).filter(Boolean).join('\n\n') },
    { title: 'Why Choose Us', content: `• **AI-Powered Efficiency** — We use advanced AI tools to produce more content, faster, without sacrificing quality\n• **Data-Driven Decisions** — Every campaign is measured and optimized based on real performance data\n• **Transparent Reporting** — You see exactly what we do and the results it produces, every month\n• **Dedicated Team** — A dedicated account manager who knows your business inside out` },
  ];

  const deliverables = config.services.flatMap((s) => {
    const sd = serviceDescriptions[s];
    return sd ? sd.deliverables.map((d) => ({ item: d, frequency: 'Monthly', description: sd.desc.split('.')[0] })) : [];
  });

  const pricing = config.services.map((s) => {
    const sd = serviceDescriptions[s];
    return { item: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), price: sd?.price ?? 'Custom', details: sd?.desc.split('.')[0] ?? '' };
  });

  const timeline = [
    { phase: 'Onboarding & Discovery', duration: 'Week 1-2', deliverables: ['Brand audit', 'Competitor analysis', 'Strategy document', 'Content calendar'] },
    { phase: 'Setup & Launch', duration: 'Week 3-4', deliverables: ['Account setup', 'First batch of content', 'Ad campaigns live', 'Tracking configured'] },
    { phase: 'Optimization', duration: 'Month 2-3', deliverables: ['Performance analysis', 'Strategy refinement', 'A/B testing', 'Scaling winners'] },
    { phase: 'Growth & Scale', duration: 'Month 4+', deliverables: ['Expanded content', 'New channels', 'Advanced automation', 'Quarterly business reviews'] },
  ];

  await ref.set({
    id: ref.id, workspaceId,
    clientName: config.clientName, clientIndustry: config.clientIndustry,
    services: config.services, monthlyBudget: config.monthlyBudget, duration: config.duration,
    sections, deliverables, pricing, timeline,
    status: 'draft',
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });

  return { id: ref.id, sections, deliverables, pricing, timeline };
}
