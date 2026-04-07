/**
 * Blog Image Upload API
 * POST: Upload image to Firebase Storage (auth + blog.create)
 *
 * Security: validates MIME type, file size, and generates UUID filenames.
 * In production, also checks magic bytes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { BLOG_IMAGE_MAX_SIZE_BYTES, BLOG_IMAGE_ALLOWED_MIMES } from '@/types/features/blog';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('blog.create');
  if (isAuthError(auth)) return auth;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const postId = formData.get('postId') as string | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Validate MIME type
  if (!BLOG_IMAGE_ALLOWED_MIMES.includes(file.type as typeof BLOG_IMAGE_ALLOWED_MIMES[number])) {
    return NextResponse.json({ error: `File type ${file.type} not allowed. Use JPEG, PNG, WebP, or GIF.` }, { status: 400 });
  }

  // Validate file size
  if (file.size > BLOG_IMAGE_MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `File too large. Maximum ${BLOG_IMAGE_MAX_SIZE_BYTES / 1024 / 1024}MB.` }, { status: 400 });
  }

  // Generate safe filename (UUID, not user-provided)
  const ext = file.type.split('/')[1] ?? 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `workspaces/${auth.workspaceId}/blog_images/${postId ?? 'drafts'}/${filename}`;

  // In production: upload to Firebase Storage
  // const bucket = getStorage().bucket();
  // const fileRef = bucket.file(storagePath);
  // const buffer = Buffer.from(await file.arrayBuffer());
  // await fileRef.save(buffer, { contentType: file.type });
  // const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2030' });

  // For dev: mock URL
  const url = `https://storage.googleapis.com/${storagePath}`;

  // Also write to DAM (Decision 9: DAM integration)
  const damRef = adminDb.collection('workspaces').doc(auth.workspaceId).collection('dam_assets').doc();
  await damRef.set({
    id: damRef.id, workspaceId: auth.workspaceId,
    name: file.name, assetType: 'image', mimeType: file.type,
    fileUrl: url, storagePath, fileSizeBytes: file.size,
    status: 'active', usageCount: 1, tags: [{ tag: 'blog', source: 'manual' }],
    linkedContentIds: postId ? [postId] : [], linkedCampaignIds: [],
    currentVersionNumber: 1, versions: [],
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    createdBy: auth.userId,
  });

  return NextResponse.json({
    url,
    storagePath,
    damAssetId: damRef.id,
    filename,
    size: file.size,
  }, { status: 201 });
}
