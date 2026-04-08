/**
 * 30-Day Content Calendar Generator
 * Input business type + goals → AI generates a full month of social content.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { CalendarPlanDay } from '@/types/features/marketing-ai';

const col = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('content_calendar_plans');

export async function listCalendarPlans(workspaceId: string) {
  const snap = await col(workspaceId).limit(20).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function generateCalendarPlan(
  workspaceId: string,
  config: { businessType: string; goals: string[]; platforms: string[]; postsPerWeek: number },
  createdBy: string,
) {
  const ref = col(workspaceId).doc();
  const startDate = new Date();
  const days: CalendarPlanDay[] = [];
  const themes = ['Educational', 'Behind the scenes', 'Social proof', 'Promotional'];
  const platforms = config.platforms.length > 0 ? config.platforms : ['instagram', 'linkedin', 'twitter'];
  const postsPerDay = Math.ceil(config.postsPerWeek / 5); // Weekdays only

  const TOPIC_BANKS: Record<string, string[]> = {
    default: ['Industry tips', 'Customer success story', 'Product feature', 'Team culture', 'How-to guide', 'FAQ answer', 'Trending topic', 'Quote of the day', 'Behind the scenes', 'Poll / question'],
    photography: ['Lighting tips', 'Editing workflow', 'Client photoshoot BTS', 'Portfolio showcase', 'Gear review', 'Before/after edit', 'Composition tips', 'Client testimonial', 'Photography myth-busting', 'Creative challenge'],
    saas: ['Feature spotlight', 'Customer case study', 'Integration tip', 'Product update', 'Industry trend', 'Comparison post', 'Tutorial / how-to', 'Team spotlight', 'Roadmap preview', 'Free resource'],
    restaurant: ['Daily special', 'Chef spotlight', 'Food prep BTS', 'Customer review', 'New menu item', 'Recipe tip', 'Event announcement', 'Seasonal ingredients', 'Staff story', 'Community shoutout'],
    fitness: ['Workout of the day', 'Nutrition tip', 'Transformation story', 'Exercise form guide', 'Motivation quote', 'Supplement review', 'Recovery tips', 'Challenge launch', 'Q&A session', 'Trainer spotlight'],
  };

  const topics = TOPIC_BANKS[config.businessType.toLowerCase()] ?? TOPIC_BANKS.default;
  const bestTimes: Record<string, string> = { instagram: '9:00 AM', linkedin: '8:30 AM', twitter: '12:00 PM', facebook: '10:00 AM', tiktok: '7:00 PM', youtube: '2:00 PM' };
  const mediaTypes: Record<string, string> = { instagram: 'carousel', linkedin: 'text', twitter: 'text', facebook: 'image', tiktok: 'video', youtube: 'video' };

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    const dayPosts = [];
    if (!isWeekend || config.postsPerWeek >= 6) {
      const numPosts = isWeekend ? 1 : postsPerDay;
      for (let p = 0; p < numPosts; p++) {
        const platform = platforms[(i + p) % platforms.length];
        const topic = topics[(i * postsPerDay + p) % topics.length];
        const theme = themes[Math.floor(i / 7) % themes.length];

        dayPosts.push({
          platform,
          contentType: 'social_post',
          topic: `[${theme}] ${topic}`,
          caption: `${topic} for ${config.businessType}. Share your experience! #${config.businessType.replace(/\s+/g, '')} #${topic.replace(/\s+/g, '')}`,
          hashtags: [`#${config.businessType.replace(/\s+/g, '')}`, `#${topic.split(' ')[0]}`, '#marketing', '#growth'],
          bestTime: bestTimes[platform] ?? '9:00 AM',
          mediaType: (mediaTypes[platform] ?? 'image') as 'image' | 'video' | 'carousel' | 'text' | 'story',
        });
      }
    }

    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      posts: dayPosts,
    });
  }

  const totalPosts = days.reduce((sum, d) => sum + d.posts.length, 0);

  await ref.set({
    id: ref.id, workspaceId,
    name: `30-Day Plan — ${config.businessType}`,
    businessType: config.businessType,
    goals: config.goals,
    platforms, postsPerWeek: config.postsPerWeek,
    totalPosts, days, themes,
    status: 'completed',
    createdAt: FieldValue.serverTimestamp(), createdBy,
  });

  return { id: ref.id, totalPosts, days, themes };
}
