/**
 * Cortex Proactive Suggestions — Phase 11D
 * Surfaces unsolicited recommendations based on workspace state.
 * Triggers: dashboard load, content save, anomaly detection, lead capture.
 */

import { adminDb } from '@/lib/firebase/admin';

export interface ProactiveSuggestion {
  id: string;
  type: 'greeting' | 'content_tip' | 'anomaly' | 'opportunity' | 'reminder';
  title: string;
  message: string;
  actionLabel?: string;
  actionPrompt?: string;             // What to send to Cortex if user clicks
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generate dashboard greeting suggestions based on workspace state.
 */
export async function getDashboardSuggestions(workspaceId: string, userId: string): Promise<ProactiveSuggestion[]> {
  const suggestions: ProactiveSuggestion[] = [];

  // Get workspace data
  const [wsDoc, membersSnap] = await Promise.all([
    adminDb.collection('workspaces').doc(workspaceId).get(),
    adminDb.collection('workspaces').doc(workspaceId).collection('members').limit(1).get(),
  ]);
  const ws = wsDoc.data() ?? {};
  const memberName = membersSnap.docs[0]?.data()?.displayName ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // 1. Greeting
  suggestions.push({
    id: 'greeting',
    type: 'greeting',
    title: `${greeting}, ${(memberName as string).split(' ')[0]}!`,
    message: `Here's what's happening with ${ws.name ?? 'your workspace'} today.`,
    priority: 'low',
  });

  // 2. Check for pending content
  try {
    const pendingSnap = await adminDb.collection('workspaces').doc(workspaceId)
      .collection('content_drafts').where('status', '==', 'draft').limit(5).get();
    if (pendingSnap.size > 0) {
      suggestions.push({
        id: 'pending_drafts',
        type: 'reminder',
        title: `${pendingSnap.size} draft${pendingSnap.size > 1 ? 's' : ''} waiting`,
        message: `You have ${pendingSnap.size} content draft${pendingSnap.size > 1 ? 's' : ''} that haven't been published yet. Want me to review and schedule them?`,
        actionLabel: 'Review drafts',
        actionPrompt: 'Show me my draft content and suggest which ones to publish',
        priority: 'medium',
      });
    }
  } catch { /* ignore */ }

  // 3. Check for new leads
  try {
    const leadsSnap = await adminDb.collection('workspaces').doc(workspaceId)
      .collection('leads').where('stage', '==', 'new').limit(10).get();
    if (leadsSnap.size > 0) {
      suggestions.push({
        id: 'new_leads',
        type: 'opportunity',
        title: `${leadsSnap.size} new lead${leadsSnap.size > 1 ? 's' : ''} to follow up`,
        message: `You have ${leadsSnap.size} new lead${leadsSnap.size > 1 ? 's' : ''} that need attention. Want me to summarize them and suggest next steps?`,
        actionLabel: 'Review leads',
        actionPrompt: 'Show me new leads and suggest follow-up actions for each',
        priority: 'high',
      });
    }
  } catch { /* ignore */ }

  // 4. Check unread platform alerts
  try {
    const alertsSnap = await adminDb.collection('workspaces').doc(workspaceId)
      .collection('platform_alerts').where('status', '==', 'unread').limit(5).get();
    if (alertsSnap.size > 0) {
      const criticalCount = alertsSnap.docs.filter((d) => d.data().severity === 'critical').length;
      suggestions.push({
        id: 'platform_alerts',
        type: 'anomaly',
        title: `${alertsSnap.size} platform alert${alertsSnap.size > 1 ? 's' : ''}${criticalCount > 0 ? ` (${criticalCount} critical)` : ''}`,
        message: 'There are platform changes that may affect your marketing strategy. Review them to stay ahead.',
        actionLabel: 'View alerts',
        actionPrompt: 'Show me the latest platform alerts and their impact on my strategy',
        priority: criticalCount > 0 ? 'high' : 'medium',
      });
    }
  } catch { /* ignore */ }

  // 5. Suggest content if nothing scheduled this week
  try {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 86400000);
    const calSnap = await adminDb.collection('workspaces').doc(workspaceId)
      .collection('calendar_events').limit(1).get();
    if (calSnap.empty) {
      suggestions.push({
        id: 'empty_calendar',
        type: 'content_tip',
        title: 'Nothing scheduled this week',
        message: 'Your content calendar is empty. Want me to generate a content plan for the next 7 days?',
        actionLabel: 'Generate plan',
        actionPrompt: 'Create a 7-day content plan for my business with posts for my connected platforms',
        priority: 'high',
      });
    }
  } catch { /* ignore */ }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate smart send-time recommendation for a platform.
 * Uses historical engagement data to find optimal posting time.
 */
export function getSmartSendTime(platform: string): { time: string; reason: string } {
  // In production: analyze workspace's historical engagement data per platform
  // For dev: return best-practice defaults based on industry research
  const OPTIMAL_TIMES: Record<string, { time: string; reason: string }> = {
    linkedin: { time: '08:30', reason: 'LinkedIn engagement peaks 8-10am on weekdays when professionals check their feed before meetings' },
    twitter: { time: '12:00', reason: 'Twitter/X sees highest engagement during lunch breaks (12-1pm) and evening commute (5-6pm)' },
    instagram: { time: '11:00', reason: 'Instagram engagement is highest mid-morning (10am-12pm) and evenings (7-9pm)' },
    facebook: { time: '10:00', reason: 'Facebook posts get most engagement between 9am-12pm, with Wednesday being the best day' },
    tiktok: { time: '19:00', reason: 'TikTok usage peaks in the evening (7-10pm) when users are relaxing after work' },
    youtube: { time: '14:00', reason: 'YouTube videos published between 2-4pm get indexed before peak viewing time (6-9pm)' },
    pinterest: { time: '20:00', reason: 'Pinterest users are most active on weekend evenings and late night (8-11pm)' },
  };

  return OPTIMAL_TIMES[platform] ?? { time: '09:00', reason: 'Default optimal time for most platforms' };
}
