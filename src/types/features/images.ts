/**
 * F13: Image Generation Types
 *
 * AI image generation, editing, library management,
 * batch processing, platform auto-sizing, accessibility.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// GENERATED IMAGE — workspaces/{workspaceId}/generated_images/{imageId}
// ═══════════════════════════════════════════════════════════

export type ImageGenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export type ImageStylePreset =
  | 'photorealistic' | 'illustration' | 'minimalist' | 'bold_graphic'
  | 'watercolor' | '3d_render' | 'abstract_geometric' | 'sketch';

export type ImageEditType =
  | 'inpaint' | 'outpaint' | 'upscale' | 'background_removal'
  | 'variation' | 'style_transfer';

export type ImageLicense = 'cc0' | 'cc-by' | 'proprietary' | 'ai-generated';

// ─── Dimension Presets ──────────────────────────────────────
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;                 // '1:1', '16:9', '9:16', etc.
  label?: string;                      // 'Instagram Square', 'LinkedIn Post', etc.
}

export const IMAGE_DIMENSION_PRESETS: ImageDimensions[] = [
  { width: 1080, height: 1080, aspectRatio: '1:1', label: 'Instagram Square / Facebook Post' },
  { width: 1080, height: 1350, aspectRatio: '4:5', label: 'Instagram Portrait' },
  { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Instagram Story / Reels / TikTok' },
  { width: 1200, height: 628, aspectRatio: '1.91:1', label: 'LinkedIn / Facebook Link Preview' },
  { width: 1200, height: 675, aspectRatio: '16:9', label: 'Twitter Post' },
  { width: 1000, height: 1500, aspectRatio: '2:3', label: 'Pinterest Pin' },
  { width: 1920, height: 1080, aspectRatio: '16:9', label: 'YouTube Thumbnail / Blog Hero' },
  { width: 1280, height: 720, aspectRatio: '16:9', label: 'YouTube Thumbnail (Standard)' },
];

// ─── Generation Parameters ──────────────────────────────────
export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;             // What to avoid
  revisedPrompt?: string;              // AI may rewrite the prompt
  model: string;                       // e.g., 'vertex-nb2', 'dall-e-3', 'mock'
  provider: 'vertex_ai' | 'openai' | 'stability' | 'adobe' | 'mock';
  width: number;
  height: number;
  aspectRatio: string;
  stylePreset?: ImageStylePreset;
  quality?: 'standard' | 'hd';
  seed?: number;                       // Reproducibility
  guidanceScale?: number;              // CFG scale (1-30, default 7)
  steps?: number;                      // Denoising steps (20-50)
  sampler?: string;                    // e.g., 'euler_a', 'dpm++_2m'

  // Reference image (image-to-image)
  referenceImageUrl?: string;
  referenceImageStrength?: number;     // 0-1

  // Brand injection
  brandColorPalette?: string[];        // Hex colors from entity_profile
  brandLogoUrl?: string;               // For watermark/overlay
}

// ─── Image Editing Parameters ───────────────────────────────
export interface ImageEditParams {
  editType: ImageEditType;
  sourceImageId: string;

  // Inpainting
  maskImageUrl?: string;
  editPrompt?: string;

  // Outpainting
  outpaintDirection?: ('top' | 'bottom' | 'left' | 'right')[];
  outpaintPixels?: number;

  // Upscaling
  upscaleFactor?: 2 | 4;

  // Background removal
  replacementColor?: string;           // Hex or null for transparent
  replacementImageUrl?: string;

  // Style transfer
  styleTransferWeight?: number;        // 0-1
  styleReferenceUrl?: string;
}

// ─── Image Metadata ─────────────────────────────────────────
export interface ImageMetadata {
  format: string;                      // 'png', 'jpg', 'webp'
  colorSpace?: string;                 // 'sRGB', 'Adobe RGB'
  dpi?: number;
  copyright?: string;
  license: ImageLicense;
  exifData?: Record<string, string>;
}

// ─── Accessibility ──────────────────────────────────────────
export interface ImageAccessibility {
  altText?: string;                    // Auto-generated from prompt
  altTextGenerated: boolean;
  colorContrastCheck?: {
    passes: boolean;
    contrastRatio: number;
    wcagLevel: 'AA' | 'AAA' | 'fail';
  };
}

// ─── Optimized Variants ─────────────────────────────────────
export interface OptimizedVariant {
  format: 'webp' | 'avif' | 'png' | 'jpg';
  fileSizeBytes: number;
  storageUrl: string;
  storagePath: string;
  compressionQuality: number;          // 0-100
}

// ─── Platform Auto-Sizing ───────────────────────────────────
export interface PlatformSizedVariant {
  platform: string;                    // 'instagram_square', 'linkedin_banner', etc.
  width: number;
  height: number;
  cropFocus: 'center' | 'top' | 'bottom' | 'face_detect';
  storageUrl: string;
  storagePath: string;
}

// ─── Template Overlay ───────────────────────────────────────
export interface TextLayer {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;                       // Hex
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
}

export interface ImageOverlay {
  templateId?: string;
  textLayers?: TextLayer[];
  logoUrl?: string;
  logoPosition?: { x: number; y: number; width: number; height: number };
  watermark?: {
    text?: string;
    imageUrl?: string;
    opacity: number;
    position: 'center' | 'bottom-right' | 'bottom-left';
  };
}

// ─── Usage Tracking ─────────────────────────────────────────
export interface ImageUsageEntry {
  contentId: string;
  contentType: 'draft' | 'email_campaign' | 'social_post';
  linkedAt: FirestoreTimestamp;
  linkedBy: string;
}

// ─── Main Generated Image ───────────────────────────────────
export interface GeneratedImage {
  id: string;
  workspaceId: string;
  clientId?: string;

  // Generation
  generationParams: ImageGenerationParams;
  status: ImageGenerationStatus;
  generationTimeMs?: number;
  estimatedCostCents?: number;

  // Storage
  storageUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  originalFileSizeBytes: number;

  // Dimensions
  width: number;
  height: number;
  aspectRatio: string;

  // Metadata & accessibility
  metadata: ImageMetadata;
  accessibility: ImageAccessibility;

  // Variants
  optimizedVariants?: OptimizedVariant[];
  platformVariants?: PlatformSizedVariant[];

  // Editing history
  editHistory?: {
    editType: ImageEditType;
    editParams: ImageEditParams;
    resultImageId: string;
    editedAt: FirestoreTimestamp;
    editedBy: string;
  }[];

  // Overlay
  overlay?: ImageOverlay;

  // Organization
  tags?: string[];
  collectionId?: string;

  // Usage
  linkedContentIds: string[];
  linkedCampaignIds?: string[];
  usageLog?: ImageUsageEntry[];
  usageCount: number;

  // Batch
  batchId?: string;

  // Timestamps
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// IMAGE COLLECTION — workspaces/{workspaceId}/image_collections/{collectionId}
// ═══════════════════════════════════════════════════════════

export interface ImageCollection {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  coverImageId?: string;
  imageCount: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// BATCH GENERATION — workspaces/{workspaceId}/image_batches/{batchId}
// ═══════════════════════════════════════════════════════════

export interface ImageBatch {
  id: string;
  workspaceId: string;
  prompt: string;
  variantCount: number;                // 1-10
  variationMode: 'seed' | 'style' | 'prompt_variation';
  seeds?: number[];
  stylePresets?: ImageStylePreset[];
  status: 'pending' | 'generating' | 'completed' | 'partial_failure';
  resultImageIds: string[];
  completedCount: number;
  failedCount: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
