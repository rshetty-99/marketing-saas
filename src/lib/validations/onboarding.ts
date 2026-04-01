import { z } from 'zod';

export const selectAccountTypeSchema = z.object({
  accountType: z.enum(['freelancer', 'organization', 'agency']),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().optional(),
});

export const quickBrandSchema = z.object({
  brandName: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  voiceTone: z.enum([
    'professional',
    'casual',
    'friendly',
    'authoritative',
    'playful',
  ]),
});

export const inviteTeamSchema = z.object({
  invitations: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'manager', 'editor', 'viewer']),
      }),
    )
    .min(1)
    .max(50),
});

export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  industry: z.string().optional(),
  assignedTeamMemberIds: z.array(z.string()).optional(),
});

// ─── Inferred Types ─────────────────────────────────────────────────
export type SelectAccountTypeInput = z.infer<typeof selectAccountTypeSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type QuickBrandInput = z.infer<typeof quickBrandSchema>;
export type InviteTeamInput = z.infer<typeof inviteTeamSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
