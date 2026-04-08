/**
 * Product Launch Playbook Generator
 * Input product details → generates launch timeline, channel strategy, emails, ads, KPIs.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('launch_playbooks');

export async function listPlaybooks(workspaceId: string) {
  const snap = await col(workspaceId).limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function generatePlaybook(
  workspaceId: string,
  config: { productName: string; productDescription: string; targetAudience: string; launchDate: string; budget: string },
  createdBy: string,
) {
  const ref = col(workspaceId).doc();

  const phases = [
    {
      name: 'Pre-Launch (4 weeks before)', durationDays: 28,
      tasks: [
        { task: 'Build landing page with email capture', channel: 'website', priority: 'critical' as const, owner: 'Marketing', details: `Create a teaser landing page for ${config.productName} with a "Get early access" email form.` },
        { task: 'Create teaser content series', channel: 'social', priority: 'high' as const, owner: 'Content', details: 'Post 3 teaser posts per week hinting at the upcoming launch. Use countdowns and sneak peeks.' },
        { task: 'Prepare email announcement sequence', channel: 'email', priority: 'critical' as const, owner: 'Email', details: 'Write 3-email pre-launch sequence: announcement, sneak peek, early access offer.' },
        { task: 'Set up ad accounts and audiences', channel: 'ads', priority: 'high' as const, owner: 'Ads', details: `Create lookalike audiences based on ${config.targetAudience}. Prepare retargeting pixels.` },
        { task: 'Brief influencers/partners', channel: 'partnerships', priority: 'medium' as const, owner: 'BD', details: 'Identify 5-10 micro-influencers in the target niche. Send product samples/access.' },
      ],
    },
    {
      name: 'Launch Week', durationDays: 7,
      tasks: [
        { task: 'Publish launch announcement everywhere', channel: 'all', priority: 'critical' as const, owner: 'Marketing', details: `Coordinate simultaneous posts across all channels. Key message: "${config.productName} is live!"` },
        { task: 'Send launch email to subscriber list', channel: 'email', priority: 'critical' as const, owner: 'Email', details: 'Send the main launch email with CTA to buy/sign up. Include limited-time launch discount.' },
        { task: 'Activate paid ad campaigns', channel: 'ads', priority: 'critical' as const, owner: 'Ads', details: `Launch Meta + Google ads targeting ${config.targetAudience}. Budget: ${config.budget}.` },
        { task: 'Post daily on social (7 consecutive days)', channel: 'social', priority: 'high' as const, owner: 'Content', details: 'Day 1: Announcement. Day 2: Features. Day 3: Social proof. Day 4: Behind the scenes. Day 5: FAQ. Day 6: Testimonial. Day 7: Last chance.' },
        { task: 'Monitor and respond to all engagement', channel: 'social', priority: 'high' as const, owner: 'Community', details: 'Reply to every comment, DM, and mention within 1 hour during launch week.' },
      ],
    },
    {
      name: 'Post-Launch (2 weeks after)', durationDays: 14,
      tasks: [
        { task: 'Collect and publish testimonials', channel: 'social', priority: 'high' as const, owner: 'Content', details: 'Reach out to early users for testimonials. Create social proof content.' },
        { task: 'Send follow-up email sequence', channel: 'email', priority: 'high' as const, owner: 'Email', details: 'Email 1: "How are you liking it?" Email 2: Tips & tricks. Email 3: Invite to leave a review.' },
        { task: 'Analyze launch metrics and ROI', channel: 'analytics', priority: 'critical' as const, owner: 'Marketing', details: 'Review: signups, revenue, CAC, engagement rates, ad performance. Document learnings.' },
        { task: 'Optimize ads based on launch data', channel: 'ads', priority: 'medium' as const, owner: 'Ads', details: 'Kill underperforming ad sets. Scale winners. Adjust targeting based on actual converters.' },
      ],
    },
  ];

  const emailSequence = [
    { subject: `Something big is coming from ${config.productName}`, sendDay: -14, purpose: 'Teaser — build anticipation' },
    { subject: `Sneak peek: First look at ${config.productName}`, sendDay: -7, purpose: 'Preview — show key features' },
    { subject: `Early access: Be the first to try ${config.productName}`, sendDay: -1, purpose: 'Early access — exclusive offer' },
    { subject: `🚀 ${config.productName} is LIVE!`, sendDay: 0, purpose: 'Launch announcement — main CTA' },
    { subject: `How ${config.productName} can help you [benefit]`, sendDay: 3, purpose: 'Value reminder — feature deep-dive' },
    { subject: `Last chance: Launch special ends tomorrow`, sendDay: 6, purpose: 'Urgency — close the launch window' },
  ];

  const kpis = [
    { metric: 'Email signups (pre-launch)', target: '500+' },
    { metric: 'Launch day website visits', target: '2,000+' },
    { metric: 'First-week conversions', target: '50+' },
    { metric: 'Social media mentions', target: '100+' },
    { metric: 'Email open rate (launch email)', target: '35%+' },
    { metric: 'Ad ROAS (return on ad spend)', target: '3x+' },
  ];

  await ref.set({
    id: ref.id, workspaceId,
    productName: config.productName, productDescription: config.productDescription,
    targetAudience: config.targetAudience, launchDate: config.launchDate, budget: config.budget,
    phases, emailSequence, socialPosts: [], adStrategy: [], kpis,
    status: 'draft',
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });

  return { id: ref.id, phases, emailSequence, kpis };
}
