/**
 * Email Sequence Generator
 * Choose type (welcome/nurture/launch) + topic → generates full multi-email sequence.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { SequenceType, EmailSequenceStep } from '@/types/features/marketing-ai';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('email_sequences');

export async function listSequences(workspaceId: string) {
  const snap = await col(workspaceId).limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const SEQUENCE_TEMPLATES: Record<SequenceType, { name: string; steps: Omit<EmailSequenceStep, 'body'>[] }> = {
  welcome: {
    name: 'Welcome Sequence',
    steps: [
      { stepNumber: 1, subject: 'Welcome to {brand}! Here\'s what to expect', previewText: 'Your journey starts now', sendDelay: 'immediately', purpose: 'Welcome & set expectations', cta: 'Get Started' },
      { stepNumber: 2, subject: 'Quick win: Do this in your first 5 minutes', previewText: 'The fastest way to see results', sendDelay: 'day 1', purpose: 'Quick value — drive first action', cta: 'Try It Now' },
      { stepNumber: 3, subject: 'How {client} got {result} with {brand}', previewText: 'Real results from real customers', sendDelay: 'day 3', purpose: 'Social proof — build trust', cta: 'See Their Story' },
      { stepNumber: 4, subject: '3 features most people miss', previewText: 'Unlock the full power', sendDelay: 'day 5', purpose: 'Feature discovery — increase usage', cta: 'Explore Features' },
      { stepNumber: 5, subject: 'Need help? We\'re here for you', previewText: 'Your success matters to us', sendDelay: 'day 7', purpose: 'Support check-in — reduce churn', cta: 'Contact Support' },
    ],
  },
  nurture: {
    name: 'Nurture Sequence',
    steps: [
      { stepNumber: 1, subject: '{topic}: The complete guide for {year}', previewText: 'Everything you need to know', sendDelay: 'day 0', purpose: 'Value-first content — establish expertise', cta: 'Read the Guide' },
      { stepNumber: 2, subject: '5 mistakes everyone makes with {topic}', previewText: 'Are you making these?', sendDelay: 'day 3', purpose: 'Problem awareness — agitate pain', cta: 'See the Mistakes' },
      { stepNumber: 3, subject: 'Case study: How we solved {problem}', previewText: 'From struggle to success', sendDelay: 'day 7', purpose: 'Social proof with narrative', cta: 'Read the Case Study' },
      { stepNumber: 4, subject: 'The {topic} checklist you\'ll actually use', previewText: 'Download your free checklist', sendDelay: 'day 10', purpose: 'Lead magnet — practical tool', cta: 'Get the Checklist' },
      { stepNumber: 5, subject: '{topic} trends you can\'t ignore in {year}', previewText: 'Stay ahead of the curve', sendDelay: 'day 14', purpose: 'Thought leadership — future-looking', cta: 'See the Trends' },
      { stepNumber: 6, subject: 'Ready to take {topic} seriously?', previewText: 'Let us help you get there', sendDelay: 'day 21', purpose: 'Soft conversion — pitch the solution', cta: 'Start Free Trial' },
    ],
  },
  launch: {
    name: 'Product Launch Sequence',
    steps: [
      { stepNumber: 1, subject: 'Something big is coming...', previewText: 'You\'re going to love this', sendDelay: 'day -14', purpose: 'Teaser — build anticipation', cta: 'Get Early Access' },
      { stepNumber: 2, subject: 'First look: Introducing {product}', previewText: 'Be the first to see it', sendDelay: 'day -7', purpose: 'Preview — show key features', cta: 'See What\'s New' },
      { stepNumber: 3, subject: 'Early access starts NOW (limited spots)', previewText: 'Don\'t miss your chance', sendDelay: 'day -1', purpose: 'Urgency — exclusive early access', cta: 'Claim Your Spot' },
      { stepNumber: 4, subject: '🚀 {product} is LIVE! Launch special inside', previewText: 'The wait is over', sendDelay: 'day 0', purpose: 'Launch announcement — main CTA', cta: 'Get Started Now' },
      { stepNumber: 5, subject: 'How {customer} is already seeing results with {product}', previewText: 'Early results are in', sendDelay: 'day 2', purpose: 'Early testimonial — social proof', cta: 'Start Your Journey' },
      { stepNumber: 6, subject: '{product} FAQ: Your top questions answered', previewText: 'We heard you — here are answers', sendDelay: 'day 4', purpose: 'Objection handling — reduce friction', cta: 'Learn More' },
      { stepNumber: 7, subject: 'Don\'t miss this: {product} launch special ends soon', previewText: 'Only 48 hours left', sendDelay: 'day 5', purpose: 'Urgency — deadline approaching', cta: 'Claim Your Discount' },
      { stepNumber: 8, subject: 'Last chance: Launch pricing ends tonight', previewText: 'This is your final reminder', sendDelay: 'day 7', purpose: 'Final deadline — close the launch', cta: 'Get It Before It\'s Gone' },
    ],
  },
  onboarding: {
    name: 'Onboarding Sequence',
    steps: [
      { stepNumber: 1, subject: 'Welcome aboard! Let\'s get you set up', previewText: 'Your first steps', sendDelay: 'immediately', purpose: 'Welcome — guide first steps', cta: 'Complete Setup' },
      { stepNumber: 2, subject: 'Day 1 tip: The one thing to do first', previewText: 'Start here for best results', sendDelay: 'day 1', purpose: 'Quick win — drive activation', cta: 'Do It Now' },
      { stepNumber: 3, subject: 'You\'re 50% set up — here\'s what\'s next', previewText: 'Keep the momentum going', sendDelay: 'day 3', purpose: 'Progress nudge — continue setup', cta: 'Continue Setup' },
      { stepNumber: 4, subject: 'Pro tip: The feature that saves 5 hours/week', previewText: 'Our most-loved feature', sendDelay: 'day 5', purpose: 'Feature highlight — increase engagement', cta: 'Try This Feature' },
      { stepNumber: 5, subject: 'How are things going? Quick check-in', previewText: 'We\'d love to hear from you', sendDelay: 'day 7', purpose: 'Check-in — identify at-risk users', cta: 'Share Feedback' },
    ],
  },
  re_engagement: {
    name: 'Re-engagement Sequence',
    steps: [
      { stepNumber: 1, subject: 'We miss you, {name}!', previewText: 'It\'s been a while', sendDelay: 'day 0', purpose: 'Emotional reconnection', cta: 'Come Back' },
      { stepNumber: 2, subject: 'A lot has changed since you left...', previewText: 'See what\'s new', sendDelay: 'day 3', purpose: 'Show new features/value', cta: 'See What\'s New' },
      { stepNumber: 3, subject: 'Here\'s a special offer just for you', previewText: 'We want to make it worth your while', sendDelay: 'day 7', purpose: 'Incentive — discount/offer', cta: 'Claim Your Offer' },
    ],
  },
  upsell: {
    name: 'Upsell Sequence',
    steps: [
      { stepNumber: 1, subject: 'You\'re outgrowing your current plan', previewText: 'Time to level up?', sendDelay: 'day 0', purpose: 'Identify growth — plant the seed', cta: 'See Upgrade Options' },
      { stepNumber: 2, subject: 'What {plan} users get that you don\'t (yet)', previewText: 'Unlock these features', sendDelay: 'day 3', purpose: 'Feature comparison — create desire', cta: 'Compare Plans' },
      { stepNumber: 3, subject: 'Upgrade this week and get 20% off', previewText: 'Limited time offer', sendDelay: 'day 7', purpose: 'Incentive + urgency', cta: 'Upgrade Now' },
    ],
  },
};

export async function generateSequence(
  workspaceId: string,
  config: { sequenceType: SequenceType; topic: string; targetAudience: string; brandName?: string },
  createdBy: string,
) {
  const template = SEQUENCE_TEMPLATES[config.sequenceType];
  if (!template) throw new Error(`Unknown sequence type: ${config.sequenceType}`);

  const ref = col(workspaceId).doc();
  const brand = config.brandName ?? 'Your Brand';
  const year = new Date().getFullYear();

  const steps: EmailSequenceStep[] = template.steps.map((step) => ({
    ...step,
    subject: step.subject
      .replace(/\{brand\}/g, brand)
      .replace(/\{topic\}/g, config.topic)
      .replace(/\{product\}/g, config.topic)
      .replace(/\{year\}/g, String(year))
      .replace(/\{name\}/g, '{{firstName}}')
      .replace(/\{client\}/g, 'one of our clients')
      .replace(/\{customer\}/g, 'an early adopter')
      .replace(/\{result\}/g, 'amazing results')
      .replace(/\{problem\}/g, `common ${config.topic} challenges`)
      .replace(/\{plan\}/g, 'Pro'),
    previewText: step.previewText,
    body: `Dear {{firstName}},\n\n[Email body for "${step.purpose}" — Topic: ${config.topic}]\n\nThis email is part of the ${template.name} for ${config.targetAudience}.\n\n${step.cta}\n\nBest regards,\n${brand}`,
  }));

  const estimatedDays = template.steps.reduce((max, s) => {
    const day = parseInt(s.sendDelay.replace(/\D/g, '')) || 0;
    return Math.max(max, Math.abs(day));
  }, 0);

  await ref.set({
    id: ref.id, workspaceId,
    name: `${template.name} — ${config.topic}`,
    sequenceType: config.sequenceType,
    topic: config.topic, targetAudience: config.targetAudience,
    steps, totalEmails: steps.length,
    estimatedDuration: `${estimatedDays} days`,
    status: 'draft',
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });

  return { id: ref.id, name: template.name, steps, totalEmails: steps.length, estimatedDuration: `${estimatedDays} days` };
}
