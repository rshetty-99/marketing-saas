import { z } from 'zod';

export const generateImageSchema = z.object({
  prompt: z.string().min(3).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  width: z.number().int().min(256).max(4096).optional(),
  height: z.number().int().min(256).max(4096).optional(),
  stylePreset: z.enum([
    'photorealistic', 'illustration', 'minimalist', 'bold_graphic',
    'watercolor', '3d_render', 'abstract_geometric', 'sketch',
  ]).optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  seed: z.number().int().optional(),
  guidanceScale: z.number().min(1).max(30).optional(),
  referenceImageUrl: z.string().url().optional(),
  referenceImageStrength: z.number().min(0).max(1).optional(),
  injectBrandColors: z.boolean().optional(),
  variantCount: z.number().int().min(1).max(10).optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
