/**
 * In-App Guided Tours & Starter Templates Service
 * Tour definitions, checklist tracking, template library.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ── Guided Tours (static definitions) ──────────────────────

const TOURS: Record<string, { id: string; featureId: string; title: string; steps: { targetSelector: string; title: string; description: string; position: 'top' | 'bottom' | 'left' | 'right' }[] }> = {
  dashboard_overview: {
    id: 'dashboard_overview',
    featureId: 'dashboard',
    title: 'Welcome to Your Dashboard',
    steps: [
      { targetSelector: '[data-testid="sidebar-nav"]', title: 'Navigation', description: 'Use the sidebar to access all features — content, calendar, analytics, and more.', position: 'right' },
      { targetSelector: '[data-testid="profile-score"]', title: 'Profile Score', description: 'Your profile score shows how complete your workspace setup is. Aim for 100%!', position: 'bottom' },
      { targetSelector: '[data-testid="quick-stats"]', title: 'Quick Stats', description: 'See your key metrics at a glance — content published, engagement, and upcoming tasks.', position: 'bottom' },
    ],
  },
  content_creation: {
    id: 'content_creation',
    featureId: 'F1',
    title: 'Create Your First Content',
    steps: [
      { targetSelector: '[data-testid="create-content-button"]', title: 'Create Content', description: 'Click here to create AI-powered content for any platform.', position: 'bottom' },
      { targetSelector: '[data-testid="platform-selector"]', title: 'Choose Platforms', description: 'Select which platforms to generate content for — LinkedIn, Instagram, Twitter, and more.', position: 'bottom' },
      { targetSelector: '[data-testid="ai-settings"]', title: 'AI Settings', description: 'Adjust tone, length, and style to match your brand voice.', position: 'left' },
    ],
  },
  calendar_tour: {
    id: 'calendar_tour',
    featureId: 'F3',
    title: 'Content Calendar',
    steps: [
      { targetSelector: '[data-testid="calendar-view"]', title: 'Calendar View', description: 'See all your scheduled content in one place. Drag to reschedule.', position: 'top' },
      { targetSelector: '[data-testid="calendar-filters"]', title: 'Filters', description: 'Filter by platform, status, or team member.', position: 'right' },
    ],
  },
  analytics_tour: {
    id: 'analytics_tour',
    featureId: 'F9',
    title: 'Analytics Overview',
    steps: [
      { targetSelector: '[data-testid="analytics-chart"]', title: 'Performance Charts', description: 'Track impressions, engagement, and growth over time.', position: 'bottom' },
      { targetSelector: '[data-testid="platform-breakdown"]', title: 'Platform Breakdown', description: 'Compare performance across all connected platforms.', position: 'left' },
    ],
  },
  brand_voice_tour: {
    id: 'brand_voice_tour',
    featureId: 'F8',
    title: 'Set Up Brand Voice',
    steps: [
      { targetSelector: '[data-testid="brand-voice-form"]', title: 'Brand Voice', description: 'Define your tone, keywords, and writing style so AI generates on-brand content.', position: 'right' },
      { targetSelector: '[data-testid="brand-assets"]', title: 'Brand Assets', description: 'Upload logos, colors, and fonts for consistent branding.', position: 'bottom' },
    ],
  },
};

export function getTour(tourId: string) {
  return TOURS[tourId] ?? null;
}

export function listTours() {
  return Object.values(TOURS);
}

// ── Onboarding Checklist ───────────────────────────────────

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'complete_profile', label: 'Complete your business profile', description: 'Add your company info, logo, and contact details.', featureLink: '/dashboard/settings' },
  { id: 'set_brand_voice', label: 'Set up brand voice', description: 'Define your tone and style for AI content generation.', featureLink: '/dashboard/brand' },
  { id: 'connect_social', label: 'Connect a social account', description: 'Link at least one social media platform.', featureLink: '/dashboard/social' },
  { id: 'create_first_content', label: 'Create your first content', description: 'Use AI to generate a post or article.', featureLink: '/dashboard/content' },
  { id: 'schedule_content', label: 'Schedule a post', description: 'Add content to your calendar for automatic publishing.', featureLink: '/dashboard/calendar' },
  { id: 'invite_team', label: 'Invite a team member', description: 'Collaborate by inviting colleagues to your workspace.', featureLink: '/dashboard/team' },
  { id: 'upload_asset', label: 'Upload a brand asset', description: 'Add logos, images, or documents to your asset library.', featureLink: '/dashboard/assets' },
  { id: 'view_analytics', label: 'Check your analytics', description: 'Review performance metrics for your content.', featureLink: '/dashboard/analytics' },
];

export async function getOnboardingChecklist(workspaceId: string) {
  const doc = await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('onboarding_checklist').get();

  if (doc.exists) return doc.data();

  // Initialize with defaults
  const checklist = {
    workspaceId,
    items: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
      ...item, completed: false, completedAt: null,
    })),
    dismissedAt: null,
  };
  await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('onboarding_checklist').set(checklist);
  return checklist;
}

export async function completeChecklistItem(workspaceId: string, itemId: string) {
  const ref = adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('onboarding_checklist');
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data()!;
  const items = (data.items ?? []) as { id: string; completed: boolean; completedAt: unknown }[];
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return;

  items[idx].completed = true;
  items[idx].completedAt = FieldValue.serverTimestamp();
  await ref.update({ items, updatedAt: FieldValue.serverTimestamp() });
}

export async function dismissChecklist(workspaceId: string) {
  await adminDb.collection('workspaces').doc(workspaceId)
    .collection('settings').doc('onboarding_checklist')
    .update({ dismissedAt: FieldValue.serverTimestamp() });
}

// ── Starter Templates ──────────────────────────────────────

export async function listStarterTemplates(category?: string) {
  let query = adminDb.collection('starter_templates')
    .orderBy('usageCount', 'desc').limit(50) as FirebaseFirestore.Query;
  if (category) query = query.where('category', '==', category);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getStarterTemplate(templateId: string) {
  const doc = await adminDb.collection('starter_templates').doc(templateId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function incrementTemplateUsage(templateId: string) {
  await adminDb.collection('starter_templates').doc(templateId)
    .update({ usageCount: FieldValue.increment(1) });
}
