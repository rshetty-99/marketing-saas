/**
 * Interactive Content Service
 * Quizzes, calculators, assessments — builder, embed, lead capture, analytics.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const contentCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('interactive_content');
const submissionsCol = (wid: string, contentId: string) => contentCol(wid).doc(contentId).collection('submissions');

// ── CRUD ───────────────────────────────────────────────────

export async function listInteractiveContent(workspaceId: string, status?: string) {
  let query = contentCol(workspaceId).limit(50) as FirebaseFirestore.Query;
  if (status) query = query.where('status', '==', status);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getInteractiveContent(workspaceId: string, contentId: string) {
  const doc = await contentCol(workspaceId).doc(contentId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createInteractiveContent(workspaceId: string, data: Record<string, unknown>, createdBy: string) {
  const ref = contentCol(workspaceId).doc();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const embedCode = `<iframe src="${baseUrl}/embed/interactive/${ref.id}" width="100%" height="600" frameborder="0" allow="clipboard-write"></iframe>`;

  await ref.set({
    id: ref.id, workspaceId, status: 'draft',
    questions: [], results: [], scoringMethod: 'sum',
    collectEmail: true, collectName: true, collectPhone: false, collectCompany: false,
    captureBeforeResults: true, gdprConsentRequired: false,
    showProgressBar: true, showQuestionNumbers: true,
    embedCode, allowedDomains: [],
    views: 0, starts: 0, completions: 0, leadsCaptures: 0, completionRate: 0, avgTimeSeconds: 0,
    ...data,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy,
  });
  return { id: ref.id, embedCode };
}

export async function updateInteractiveContent(workspaceId: string, contentId: string, data: Record<string, unknown>) {
  await contentCol(workspaceId).doc(contentId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function publishInteractiveContent(workspaceId: string, contentId: string) {
  await contentCol(workspaceId).doc(contentId).update({
    status: 'published', publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

// ── Submissions (public) ───────────────────────────────────

export async function submitResponse(
  workspaceId: string,
  contentId: string,
  submission: Record<string, unknown>,
) {
  const ref = submissionsCol(workspaceId, contentId).doc();
  await ref.set({
    id: ref.id, contentId, workspaceId,
    ...submission,
    completedAt: FieldValue.serverTimestamp(),
  });

  // Update analytics counters
  await contentCol(workspaceId).doc(contentId).update({
    completions: FieldValue.increment(1),
    leadsCaptures: submission.email ? FieldValue.increment(1) : FieldValue.increment(0),
  });

  // If email captured, create a lead
  if (submission.email) {
    const leadRef = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc();
    await leadRef.set({
      id: leadRef.id, workspaceId,
      email: submission.email, firstName: submission.name ?? null,
      phone: submission.phone ?? null, company: submission.company ?? null,
      stage: 'new', score: 2, enriched: false, tags: ['interactive_content'],
      source: { type: 'form', formId: contentId, contentType: submission.contentType ?? 'interactive' },
      notes: [], createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'interactive-submission',
    });
    return { id: ref.id, leadId: leadRef.id };
  }

  return { id: ref.id };
}

export async function listSubmissions(workspaceId: string, contentId: string, limit: number = 50) {
  const snap = await submissionsCol(workspaceId, contentId).limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Templates ──────────────────────────────────────────────

export const INTERACTIVE_TEMPLATES = [
  {
    id: 'marketing_readiness_quiz',
    type: 'quiz' as const,
    title: 'Marketing Readiness Quiz',
    description: 'How ready is your business for modern marketing? Score yourself across 5 dimensions.',
    questions: [
      { id: 'q1', order: 1, text: 'How many social media platforms are you actively posting on?', type: 'single_choice' as const, required: true, options: [{ label: 'None', value: '0', score: 0 }, { label: '1-2', value: '1-2', score: 5 }, { label: '3-5', value: '3-5', score: 10 }, { label: '6+', value: '6+', score: 15 }] },
      { id: 'q2', order: 2, text: 'Do you have a documented content strategy?', type: 'yes_no' as const, required: true, options: [{ label: 'Yes', value: 'yes', score: 15 }, { label: 'No', value: 'no', score: 0 }] },
      { id: 'q3', order: 3, text: 'How often do you publish new content?', type: 'single_choice' as const, required: true, options: [{ label: 'Rarely', value: 'rarely', score: 0 }, { label: 'Monthly', value: 'monthly', score: 5 }, { label: 'Weekly', value: 'weekly', score: 10 }, { label: 'Daily', value: 'daily', score: 15 }] },
      { id: 'q4', order: 4, text: 'Do you track marketing ROI?', type: 'yes_no' as const, required: true, options: [{ label: 'Yes', value: 'yes', score: 15 }, { label: 'No', value: 'no', score: 0 }] },
      { id: 'q5', order: 5, text: 'How would you rate your brand consistency across channels?', type: 'rating' as const, required: true, min: 1, max: 5 },
    ],
    results: [
      { id: 'r1', title: 'Marketing Beginner', description: 'You\'re just getting started! There\'s huge potential for growth. Start with a content calendar and consistent posting schedule.', minScore: 0, maxScore: 20, ctaText: 'Start Your Free Trial', ctaUrl: '/sign-up' },
      { id: 'r2', title: 'Growing Marketer', description: 'You have the basics down but there\'s room to level up. Focus on analytics and multi-platform strategy.', minScore: 21, maxScore: 45, ctaText: 'See How Aura Helps', ctaUrl: '/#features' },
      { id: 'r3', title: 'Marketing Pro', description: 'Impressive! You\'re running a strong marketing operation. Aura can help you scale with AI and automation.', minScore: 46, maxScore: 75, ctaText: 'Scale with Aura', ctaUrl: '/sign-up' },
    ],
  },
  {
    id: 'roi_calculator',
    type: 'calculator' as const,
    title: 'Marketing ROI Calculator',
    description: 'Calculate how much time and money you could save by consolidating your marketing tools.',
    questions: [
      { id: 'q1', order: 1, text: 'How many marketing tools do you currently use?', type: 'range' as const, required: true, min: 1, max: 20 },
      { id: 'q2', order: 2, text: 'Average monthly cost per tool ($)?', type: 'range' as const, required: true, min: 0, max: 500 },
      { id: 'q3', order: 3, text: 'Hours per week spent on content creation?', type: 'range' as const, required: true, min: 0, max: 40 },
      { id: 'q4', order: 4, text: 'Hours per week on manual scheduling & reporting?', type: 'range' as const, required: true, min: 0, max: 20 },
      { id: 'q5', order: 5, text: 'How many clients do you manage?', type: 'range' as const, required: true, min: 1, max: 100 },
    ],
    results: [],
  },
  {
    id: 'agency_growth_assessment',
    type: 'assessment' as const,
    title: 'Agency Growth Assessment',
    description: 'Evaluate your agency\'s growth readiness across operations, talent, technology, and client management.',
    questions: [
      { id: 'q1', order: 1, text: 'How scalable is your content production process?', type: 'single_choice' as const, required: true, options: [{ label: 'Not at all — everything is manual', value: 'manual', score: 0 }, { label: 'Somewhat — we use some tools', value: 'some', score: 10 }, { label: 'Very — we have AI + automation', value: 'automated', score: 20 }] },
      { id: 'q2', order: 2, text: 'Can you onboard a new client in under 1 week?', type: 'yes_no' as const, required: true, options: [{ label: 'Yes', value: 'yes', score: 15 }, { label: 'No', value: 'no', score: 0 }] },
      { id: 'q3', order: 3, text: 'Do you have white-label reporting for clients?', type: 'yes_no' as const, required: true, options: [{ label: 'Yes', value: 'yes', score: 15 }, { label: 'No', value: 'no', score: 0 }] },
      { id: 'q4', order: 4, text: 'What percentage of your revenue is recurring (retainers)?', type: 'single_choice' as const, required: true, options: [{ label: 'Under 25%', value: 'low', score: 5 }, { label: '25-50%', value: 'medium', score: 10 }, { label: '50-75%', value: 'high', score: 15 }, { label: 'Over 75%', value: 'very_high', score: 20 }] },
      { id: 'q5', order: 5, text: 'How many hours per week does your team spend on reporting?', type: 'range' as const, required: true, min: 0, max: 30 },
    ],
    results: [
      { id: 'r1', title: 'Growth-Ready', description: 'Your agency has the foundations for rapid scaling. Focus on automation and client acquisition.', minScore: 45, maxScore: 75, ctaText: 'Scale with Aura', ctaUrl: '/sign-up' },
      { id: 'r2', title: 'Building Momentum', description: 'You\'re on the right track but need to streamline operations before taking on more clients.', minScore: 20, maxScore: 44, ctaText: 'See How Aura Helps', ctaUrl: '/#features' },
      { id: 'r3', title: 'Foundation Stage', description: 'Focus on building repeatable processes before scaling. Aura can help automate the fundamentals.', minScore: 0, maxScore: 19, ctaText: 'Start Your Free Trial', ctaUrl: '/sign-up' },
    ],
  },
];
