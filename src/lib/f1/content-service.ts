/**
 * F1: Content Generation Service
 *
 * Handles content CRUD, AI generation (mock for now), scoring,
 * and repurposing (F2 integrated — creates new drafts with sourceDraftId).
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getBrandProfile, scoreBrandVoiceConsistency, buildVoiceSystemPrompt } from '@/lib/f8/brand-service';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { ContentDraft, ContentType, Channel, CreationMethod, ContentScores } from '@/types/features/content';

// ─── Create Draft ───────────────────────────────────────────

export async function createDraft(
  workspaceId: string,
  data: {
    title: string;
    content: string;
    contentType: ContentType;
    channel?: Channel;
    creationMethod?: CreationMethod;
    sourceDraftId?: string;
    sourceChannel?: string;
    clientId?: string;
    assignedTo?: string;
    tags?: string[];
    [key: string]: unknown;
  },
  createdBy: string,
): Promise<string> {
  const draftRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc();

  const wordCount = data.content.split(/\s+/).filter(Boolean).length;
  const characterCount = data.content.length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  // Score brand voice if profile exists
  let scores: ContentScores | undefined;
  if (data.content.length > 20) {
    const brand = await getBrandProfile(workspaceId);
    if (brand?.brandVoice) {
      const brandVoiceScore = scoreBrandVoiceConsistency(data.content, brand.brandVoice);
      scores = { brandVoice: brandVoiceScore };
    }
  }

  await draftRef.set({
    id: draftRef.id,
    workspaceId,
    ...data,
    status: 'draft',
    creationMethod: data.creationMethod ?? 'manual',
    scores: scores ?? null,
    wordCount,
    characterCount,
    readingTimeMinutes,
    currentVersionNumber: 1,
    versionHistory: [{
      versionId: `v1_${Date.now()}`,
      versionNumber: 1,
      content: data.content,
      title: data.title,
      changeType: data.creationMethod === 'ai_generated' ? 'ai_generation' : 'manual_save',
      changedBy: createdBy,
      createdAt: FieldValue.serverTimestamp(),
    }],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy,
  });

  await writeAuditLog(workspaceId, {
    action: 'content.created',
    resourceType: 'content',
    resourceId: draftRef.id,
    resourceName: data.title,
    actorId: createdBy,
    details: { contentType: data.contentType, creationMethod: data.creationMethod ?? 'manual' },
  });

  return draftRef.id;
}

// ─── Update Draft ───────────────────────────────────────────

export async function updateDraft(
  workspaceId: string,
  draftId: string,
  updates: Record<string, unknown>,
  updatedBy: string,
): Promise<void> {
  const draftRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(draftId);

  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) throw new Error('Draft not found');

  const currentData = draftSnap.data();

  // Recalculate word count if content changed
  if (typeof updates.content === 'string') {
    const content = updates.content as string;
    updates.wordCount = content.split(/\s+/).filter(Boolean).length;
    updates.characterCount = content.length;
    updates.readingTimeMinutes = Math.ceil((updates.wordCount as number) / 200);

    // Re-score brand voice
    if (content.length > 20) {
      const brand = await getBrandProfile(workspaceId);
      if (brand?.brandVoice) {
        const brandVoiceScore = scoreBrandVoiceConsistency(content, brand.brandVoice);
        updates.scores = { ...currentData?.scores, brandVoice: brandVoiceScore };
      }
    }

    // Add version to history
    const currentVersion = currentData?.currentVersionNumber ?? 1;
    const newVersion = currentVersion + 1;
    updates.currentVersionNumber = newVersion;
    updates.versionHistory = FieldValue.arrayUnion({
      versionId: `v${newVersion}_${Date.now()}`,
      versionNumber: newVersion,
      content,
      title: updates.title ?? currentData?.title,
      changeType: 'manual_save',
      changedBy: updatedBy,
      createdAt: new Date().toISOString(),
    });
  }

  await draftRef.update({
    ...updates,
    updatedBy,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ─── List Drafts ────────────────────────────────────────────

export async function listDrafts(
  workspaceId: string,
  filters: {
    status?: string;
    contentType?: string;
    channel?: string;
    clientId?: string;
    assignedTo?: string;
    limit?: number;
  } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .orderBy('updatedAt', 'desc')
    .limit(filters.limit ?? 50) as FirebaseFirestore.Query;

  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.contentType) query = query.where('contentType', '==', filters.contentType);
  if (filters.clientId) query = query.where('clientId', '==', filters.clientId);
  if (filters.assignedTo) query = query.where('assignedTo', '==', filters.assignedTo);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Get Draft ──────────────────────────────────────────────

export async function getDraft(
  workspaceId: string,
  draftId: string,
): Promise<Record<string, unknown> | null> {
  const doc = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(draftId)
    .get();

  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// ─── Delete Draft ───────────────────────────────────────────

export async function deleteDraft(
  workspaceId: string,
  draftId: string,
  deletedBy: string,
): Promise<void> {
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(draftId)
    .update({
      status: 'archived',
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: deletedBy,
    });

  await writeAuditLog(workspaceId, {
    action: 'content.deleted',
    resourceType: 'content',
    resourceId: draftId,
    actorId: deletedBy,
  });
}

// ─── AI Content Generation (mock for now) ───────────────────

export async function generateContentWithAI(
  workspaceId: string,
  input: {
    prompt: string;
    contentType: ContentType;
    channel?: Channel;
    tone?: string;
    targetAudience?: string;
    keywords?: string[];
    aiCreativityLevel?: string;
    maxLength?: number;
  },
  generatedBy: string,
): Promise<string> {
  const brand = await getBrandProfile(workspaceId);

  // Build system prompt from brand voice (if configured)
  const systemPrompt = brand?.brandVoice
    ? buildVoiceSystemPrompt(brand.brandVoice)
    : 'You are a professional marketing content writer.';

  // Check if real API key is set
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let generatedContent: string;
  let aiMetadata: Record<string, unknown>;

  if (apiKey) {
    // TODO: Real Claude API call when key is configured
    // const anthropic = new Anthropic({ apiKey });
    // const response = await anthropic.messages.create({...});
    generatedContent = `[Real AI generation not yet implemented. API key is set but integration is pending.]\n\n${input.prompt}`;
    aiMetadata = {
      promptText: input.prompt,
      modelId: 'claude-sonnet-4-6',
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      generationTimeMs: 0,
      regenerationCount: 0,
      brandVoiceProfileUsed: !!brand?.brandVoice,
      generatedAt: new Date().toISOString(),
    };
  } else {
    // Mock generation
    generatedContent = generateMockContent(input.contentType, input.prompt, input.channel, input.tone);
    aiMetadata = {
      promptText: input.prompt,
      modelId: 'mock-generator',
      tokensInput: input.prompt.split(/\s+/).length,
      tokensOutput: generatedContent.split(/\s+/).length,
      totalTokens: input.prompt.split(/\s+/).length + generatedContent.split(/\s+/).length,
      generationTimeMs: 150,
      estimatedCostCents: 0,
      regenerationCount: 0,
      brandVoiceProfileUsed: !!brand?.brandVoice,
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate a title from the prompt
  const title = input.prompt.length > 60
    ? input.prompt.substring(0, 57) + '...'
    : input.prompt;

  // Create the draft
  const draftId = await createDraft(
    workspaceId,
    {
      title,
      content: generatedContent,
      contentType: input.contentType,
      channel: input.channel,
      creationMethod: 'ai_generated',
      tags: input.keywords,
    },
    generatedBy,
  );

  // Update with AI metadata (separate update to keep createDraft clean)
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('content_drafts')
    .doc(draftId)
    .update({ aiMetadata });

  return draftId;
}

// ─── F2: Repurpose Content ──────────────────────────────────

export async function repurposeContent(
  workspaceId: string,
  sourceDraftId: string,
  targetChannels: Channel[],
  createdBy: string,
): Promise<string[]> {
  const sourceDraft = await getDraft(workspaceId, sourceDraftId);
  if (!sourceDraft) throw new Error('Source draft not found');

  const sourceContent = sourceDraft.content as string;
  const sourceTitle = sourceDraft.title as string;
  const sourceChannel = (sourceDraft.channel as string) ?? 'blog';

  const draftIds: string[] = [];

  for (const channel of targetChannels) {
    // Mock repurposing — adapt content for each channel
    const repurposedContent = mockRepurposeForChannel(sourceContent, sourceTitle, channel);

    const draftId = await createDraft(
      workspaceId,
      {
        title: `[${channel}] ${sourceTitle}`,
        content: repurposedContent,
        contentType: channel === 'email' ? 'email_newsletter' : 'social_post',
        channel,
        creationMethod: 'repurposed',
        sourceDraftId,
        sourceChannel,
        clientId: sourceDraft.clientId as string | undefined,
        tags: sourceDraft.tags as string[] | undefined,
      },
      createdBy,
    );

    draftIds.push(draftId);
  }

  return draftIds;
}

// ─── Mock Content Generators ────────────────────────────────

function generateMockContent(
  contentType: ContentType,
  prompt: string,
  channel?: Channel,
  tone?: string,
): string {
  const toneLabel = tone ?? 'professional';
  const channelLabel = channel ?? 'general';

  const templates: Record<string, string> = {
    blog_post: `# ${prompt}\n\n*[AI-generated mock — tone: ${toneLabel}]*\n\nThis is a mock blog post generated from your prompt. In production, Claude will generate a full article tailored to your brand voice, target audience, and content strategy.\n\n## Key Points\n\n- Point one relates to your topic\n- Point two expands on the core idea\n- Point three provides actionable takeaways\n\n## Conclusion\n\nThis mock demonstrates the content structure. Real AI-generated content will match your configured brand voice profile, use approved terminology, and follow your content rules.\n\n*Generated for: ${channelLabel}*`,

    social_post: `${prompt}\n\n[AI-generated mock — ${channelLabel} post, tone: ${toneLabel}]\n\nThis is a mock social media post. In production, it will be optimized for ${channelLabel} with appropriate length, hashtags, and formatting.\n\n#marketing #content #auraai`,

    email_newsletter: `Subject: ${prompt}\n\nHi [First Name],\n\n[AI-generated mock email — tone: ${toneLabel}]\n\nThis is a mock email newsletter. In production, Claude will generate personalized email content matching your brand voice.\n\nBest regards,\n[Your Brand]`,

    headline: `[Mock headline — ${toneLabel}]\n${prompt}\n\nVariation 1: "${prompt} — A Fresh Perspective"\nVariation 2: "Why ${prompt} Matters Now"\nVariation 3: "The Complete Guide to ${prompt}"`,

    ad_copy: `[Mock ad copy — ${channelLabel}, tone: ${toneLabel}]\n\nHeadline: ${prompt}\nDescription: Discover how ${prompt.toLowerCase()} can transform your results. Start your free trial today.\nCTA: Get Started Free`,

    video_script: `# Video Script: ${prompt}\n\n[AI-generated mock — tone: ${toneLabel}]\n\n**HOOK (0-3s):**\nDid you know that ${prompt.toLowerCase()}?\n\n**BODY (3-45s):**\nHere's what you need to know...\n[Content about the topic]\n\n**CTA (45-60s):**\nFollow for more tips like this.\n\n*Estimated duration: 60 seconds*`,
  };

  return templates[contentType] ?? templates.blog_post;
}

function mockRepurposeForChannel(
  sourceContent: string,
  sourceTitle: string,
  targetChannel: Channel,
): string {
  const excerpt = sourceContent.substring(0, 200).replace(/[#*_]/g, '').trim();

  const templates: Record<string, string> = {
    linkedin: `${sourceTitle}\n\n${excerpt}...\n\nKey takeaway: This content was repurposed from a longer piece for LinkedIn's professional audience.\n\n#marketing #contentrepurposing #auraai`,
    twitter: `${sourceTitle}\n\n${excerpt.substring(0, 200)}...\n\n🧵 Thread below 👇`,
    instagram: `${excerpt.substring(0, 150)}...\n\n✨ Swipe for more insights\n\n.\n.\n.\n#marketing #contentcreation #digitalmarketing #socialmedia`,
    facebook: `${sourceTitle}\n\n${excerpt}...\n\nRead the full post on our blog! 👆`,
    email: `Subject: ${sourceTitle}\n\nHi there,\n\n${excerpt}...\n\nRead more on our blog.\n\nBest,\n[Your Brand]`,
    tiktok: `🎬 ${sourceTitle}\n\n${excerpt.substring(0, 100)}...\n\n#marketing #tips #learnontiktok`,
    youtube: `# ${sourceTitle}\n\nDescription:\n${excerpt}\n\nTimestamps:\n0:00 - Intro\n0:30 - Main topic\n2:00 - Key takeaways\n3:00 - Outro`,
    pinterest: `${sourceTitle}\n\n${excerpt.substring(0, 150)}...\n\nPin this for later! 📌`,
    blog: sourceContent,
    website: sourceContent,
  };

  return templates[targetChannel] ?? sourceContent;
}
