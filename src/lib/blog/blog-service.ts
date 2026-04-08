/**
 * Blog Service
 * CRUD for blog posts, comments, likes, and slug management.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sanitizeHtml, sanitizeComment, countWords, calculateReadTime, generateSlug } from './content-sanitizer';
import type { BlogPostStatus } from '@/types/features/blog';

const postsCol = (wid: string) => adminDb.collection('workspaces').doc(wid).collection('blog_posts');
const commentsCol = (wid: string, postId: string) => postsCol(wid).doc(postId).collection('comments');
const likesCol = (wid: string, postId: string) => postsCol(wid).doc(postId).collection('likes');

// ── Post CRUD ──────────────────────────────────────────────

export async function createPost(workspaceId: string, data: Record<string, unknown>, author: { userId: string; name: string; avatar?: string; role: string; bio?: string }) {
  const title = data.title as string;
  const contentHtml = sanitizeHtml(data.contentHtml as string);
  const wordCount = countWords(contentHtml);
  let slug = generateSlug(title);

  // Ensure slug uniqueness
  slug = await ensureUniqueSlug(workspaceId, slug);

  const ref = postsCol(workspaceId).doc();
  await ref.set({
    id: ref.id, workspaceId, slug, status: 'draft' as BlogPostStatus,
    title, excerpt: data.excerpt, content: data.content, contentHtml,
    coverImageUrl: data.coverImageUrl ?? null, coverImageAlt: data.coverImageAlt ?? null,
    coverImageStoragePath: data.coverImageStoragePath ?? null,
    category: data.category, tags: data.tags ?? [],
    author: { userId: author.userId, name: author.name, avatar: author.avatar ?? null, role: author.role, bio: author.bio ?? null },
    wordCount, readTimeMinutes: calculateReadTime(wordCount),
    seoTitle: data.seoTitle ?? null, seoDescription: data.seoDescription ?? null,
    ogImageUrl: data.ogImageUrl ?? null, canonicalUrl: data.canonicalUrl ?? null,
    noindex: data.noindex ?? false, focusKeyword: data.focusKeyword ?? null, seoScore: data.seoScore ?? null,
    featured: data.featured ?? false, allowComments: data.allowComments ?? true,
    likes: 0, views: 0, uniqueVisitors: 0,
    relatedPostIds: data.relatedPostIds ?? [], scheduledAt: data.scheduledAt ?? null,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: author.userId,
  });
  return { id: ref.id, slug };
}

export async function updatePost(workspaceId: string, postId: string, data: Record<string, unknown>) {
  const updates: Record<string, unknown> = { ...data, updatedAt: FieldValue.serverTimestamp() };

  if (data.contentHtml) {
    updates.contentHtml = sanitizeHtml(data.contentHtml as string);
    updates.wordCount = countWords(updates.contentHtml as string);
    updates.readTimeMinutes = calculateReadTime(updates.wordCount as number);
  }
  if (data.title) {
    const newSlug = generateSlug(data.title as string);
    updates.slug = await ensureUniqueSlug(workspaceId, newSlug, postId);
  }

  await postsCol(workspaceId).doc(postId).update(updates);
}

export async function getPost(workspaceId: string, postId: string) {
  const doc = await postsCol(workspaceId).doc(postId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getPostBySlug(workspaceId: string, slug: string) {
  const snap = await postsCol(workspaceId).where('slug', '==', slug).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function listPosts(
  workspaceId: string,
  filters: { status?: string; category?: string; featured?: boolean; limit?: number; offset?: number } = {},
) {
  let query = postsCol(workspaceId).limit(filters.limit ?? 12) as FirebaseFirestore.Query;
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.category) query = query.where('category', '==', filters.category);
  if (filters.featured) query = query.where('featured', '==', true);
  const snap = await query.get();
  // Sort in-memory to avoid composite index requirement
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aTime = (a as Record<string, unknown>).createdAt;
      const bTime = (b as Record<string, unknown>).createdAt;
      if (!aTime || !bTime) return 0;
      return String(bTime) > String(aTime) ? 1 : -1;
    });
}

export async function listPublishedPosts(workspaceId: string, filters: { category?: string; limit?: number } = {}) {
  return listPosts(workspaceId, { ...filters, status: 'published' });
}

export async function deletePost(workspaceId: string, postId: string) {
  await postsCol(workspaceId).doc(postId).update({ status: 'archived', updatedAt: FieldValue.serverTimestamp() });
}

// ── Publish / Schedule ─────────────────────────────────────

export async function publishPost(workspaceId: string, postId: string) {
  await postsCol(workspaceId).doc(postId).update({
    status: 'published', publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function unpublishPost(workspaceId: string, postId: string) {
  await postsCol(workspaceId).doc(postId).update({
    status: 'draft', publishedAt: null, updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function schedulePost(workspaceId: string, postId: string, scheduledAt: string) {
  await postsCol(workspaceId).doc(postId).update({
    status: 'review', scheduledAt: new Date(scheduledAt), updatedAt: FieldValue.serverTimestamp(),
  });
}

// ── Slug Uniqueness ────────────────────────────────────────

async function ensureUniqueSlug(workspaceId: string, slug: string, excludePostId?: string): Promise<string> {
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const snap = await postsCol(workspaceId).where('slug', '==', candidate).limit(1).get();
    if (snap.empty) return candidate;
    if (excludePostId && snap.docs[0].id === excludePostId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix++;
    if (suffix > 20) return `${slug}-${Date.now()}`; // Safety valve
  }
}

// ── Comments ───────────────────────────────────────────────

export async function addComment(workspaceId: string, postId: string, authorId: string, authorName: string, authorAvatar: string | undefined, content: string) {
  const sanitized = sanitizeComment(content);
  if (!sanitized) throw new Error('Comment content is empty');

  const ref = commentsCol(workspaceId, postId).doc();
  await ref.set({
    id: ref.id, postId, workspaceId, authorId, authorName, authorAvatar: authorAvatar ?? null,
    content: sanitized,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listComments(workspaceId: string, postId: string, limit: number = 50) {
  const snap = await commentsCol(workspaceId, postId).orderBy('createdAt', 'asc').limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteComment(workspaceId: string, postId: string, commentId: string) {
  await commentsCol(workspaceId, postId).doc(commentId).delete();
}

// ── Likes (IP-deduplicated) ────────────────────────────────

export async function toggleLike(workspaceId: string, postId: string, visitorHash: string): Promise<boolean> {
  const likeRef = likesCol(workspaceId, postId).doc(visitorHash);
  const existing = await likeRef.get();

  if (existing.exists) {
    // Unlike
    await likeRef.delete();
    await postsCol(workspaceId).doc(postId).update({ likes: FieldValue.increment(-1) });
    return false;
  }

  // Like
  await likeRef.set({ visitorHash, createdAt: FieldValue.serverTimestamp() });
  await postsCol(workspaceId).doc(postId).update({ likes: FieldValue.increment(1) });
  return true;
}

export async function hasLiked(workspaceId: string, postId: string, visitorHash: string): Promise<boolean> {
  const doc = await likesCol(workspaceId, postId).doc(visitorHash).get();
  return doc.exists;
}

// ── View Counter ───────────────────────────────────────────

export async function incrementViews(workspaceId: string, postId: string) {
  await postsCol(workspaceId).doc(postId).update({
    views: FieldValue.increment(1),
  });
}

export async function incrementUniqueVisitors(workspaceId: string, postId: string) {
  await postsCol(workspaceId).doc(postId).update({
    uniqueVisitors: FieldValue.increment(1),
  });
}
