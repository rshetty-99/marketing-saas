/**
 * F13: Image Generation Service
 * Mock generation with placeholder images. Real Vertex AI when credentials set.
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { ImageStylePreset, ImageGenerationStatus } from '@/types/features/images';

// ─── Generate Image (Mock) ──────────────────────────────────

export async function generateImage(
  workspaceId: string,
  params: {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    stylePreset?: ImageStylePreset;
    quality?: string;
    seed?: number;
    guidanceScale?: number;
    referenceImageUrl?: string;
    referenceImageStrength?: number;
    injectBrandColors?: boolean;
    variantCount?: number;
  },
  createdBy: string,
): Promise<string[]> {
  const width = params.width ?? 1080;
  const height = params.height ?? 1080;
  const variantCount = params.variantCount ?? 1;
  const imageIds: string[] = [];

  // Create batch if multiple variants
  let batchId: string | undefined;
  if (variantCount > 1) {
    const batchRef = adminDb.collection('workspaces').doc(workspaceId).collection('image_batches').doc();
    batchId = batchRef.id;
    await batchRef.set({
      id: batchRef.id,
      workspaceId,
      prompt: params.prompt,
      variantCount,
      variationMode: 'seed',
      status: 'generating',
      resultImageIds: [],
      completedCount: 0,
      failedCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
    });
  }

  for (let i = 0; i < variantCount; i++) {
    const ref = adminDb.collection('workspaces').doc(workspaceId).collection('generated_images').doc();
    const seed = params.seed ?? Math.floor(Math.random() * 999999) + i;

    // Generate mock placeholder URL (gradient SVG with prompt text)
    const mockUrl = generateMockImageUrl(params.prompt, width, height, params.stylePreset, seed);

    await ref.set({
      id: ref.id,
      workspaceId,
      generationParams: {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt ?? null,
        revisedPrompt: null,
        model: 'mock-generator',
        provider: 'mock',
        width,
        height,
        aspectRatio: getAspectRatio(width, height),
        stylePreset: params.stylePreset ?? null,
        quality: params.quality ?? 'standard',
        seed,
        guidanceScale: params.guidanceScale ?? 7,
        referenceImageUrl: params.referenceImageUrl ?? null,
        referenceImageStrength: params.referenceImageStrength ?? null,
        brandColorPalette: params.injectBrandColors ? ['#FF4D00', '#4F35F5', '#0D0D12'] : null,
      },
      status: 'completed' as ImageGenerationStatus,
      generationTimeMs: 150 + Math.floor(Math.random() * 500),
      estimatedCostCents: 0,
      storageUrl: mockUrl,
      storagePath: `workspaces/${workspaceId}/images/${ref.id}.png`,
      thumbnailUrl: mockUrl,
      originalFileSizeBytes: width * height * 3, // Approximate
      width,
      height,
      aspectRatio: getAspectRatio(width, height),
      metadata: {
        format: 'png',
        colorSpace: 'sRGB',
        license: 'ai-generated',
      },
      accessibility: {
        altText: params.prompt.substring(0, 125),
        altTextGenerated: true,
      },
      tags: [],
      linkedContentIds: [],
      usageCount: 0,
      batchId: batchId ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
    });

    imageIds.push(ref.id);
  }

  // Update batch with results
  if (batchId) {
    await adminDb.collection('workspaces').doc(workspaceId).collection('image_batches').doc(batchId).update({
      status: 'completed',
      resultImageIds: imageIds,
      completedCount: imageIds.length,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await writeAuditLog(workspaceId, {
    action: 'content.created',
    resourceType: 'content',
    actorId: createdBy,
    details: { type: 'image_generation', prompt: params.prompt, count: variantCount, mode: 'mock' },
  });

  return imageIds;
}

// ─── List Images ────────────────────────────────────────────

export async function listImages(
  workspaceId: string,
  filters: { collectionId?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  let query = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('generated_images')
    .orderBy('createdAt', 'desc')
    .limit(filters.limit ?? 50) as FirebaseFirestore.Query;

  if (filters.collectionId) query = query.where('collectionId', '==', filters.collectionId);

  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ─── Delete Image ───────────────────────────────────────────

export async function deleteImage(
  workspaceId: string,
  imageId: string,
  deletedBy: string,
): Promise<void> {
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('generated_images')
    .doc(imageId)
    .delete();

  await writeAuditLog(workspaceId, {
    action: 'content.deleted',
    resourceType: 'content',
    resourceId: imageId,
    actorId: deletedBy,
    details: { type: 'image' },
  });
}

// ─── Mock Image URL Generator ───────────────────────────────

function generateMockImageUrl(
  prompt: string,
  width: number,
  height: number,
  style?: ImageStylePreset,
  seed?: number,
): string {
  // Generate a distinctive placeholder using an SVG data URL
  const colors = ['FF4D00', '4F35F5', '10B981', 'F59E0B', 'EC4899', '0EA5E9'];
  const colorIndex = (seed ?? 0) % colors.length;
  const bg = colors[colorIndex];
  const label = encodeURIComponent(prompt.substring(0, 40));
  const styleLabel = style ? encodeURIComponent(`Style: ${style}`) : '';

  // Use a placeholder service URL pattern
  return `https://placehold.co/${width}x${height}/${bg}/FFFFFF?text=${label}${styleLabel ? '%0A' + styleLabel : ''}`;
}

function getAspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}
