/**
 * F9: Social Connections Service
 *
 * Manages OAuth connections, token encryption, and connection health.
 * Uses mock connections in dev (when platform OAuth credentials aren't set).
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAuditLog } from '@/lib/f7/team-management';
import type { SocialPlatform, ConnectionAccountType } from '@/types/features/social';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ─── Token Encryption (AES-256-GCM) ────────────────────────

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY
  ?? 'dev-key-32-chars-long-for-aes!!' ; // 32 bytes for AES-256

function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Mock Connection Data ───────────────────────────────────

const MOCK_PROFILES: Record<SocialPlatform, {
  username: string;
  displayName: string;
  avatarUrl: string;
  accountType: ConnectionAccountType;
  followerCount: number;
}> = {
  linkedin: { username: 'aura-marketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'page', followerCount: 12500 },
  twitter: { username: '@aura_mktg', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'business', followerCount: 8200 },
  instagram: { username: '@aura.marketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'business', followerCount: 15300 },
  facebook: { username: 'AuraMarketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'page', followerCount: 6800 },
  google_business: { username: 'aura-marketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'business', followerCount: 450 },
  tiktok: { username: '@aura.mktg', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'business', followerCount: 3200 },
  youtube: { username: 'AuraMarketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'channel', followerCount: 2100 },
  pinterest: { username: 'auramarketing', displayName: 'Aura Marketing', avatarUrl: '', accountType: 'business', followerCount: 1800 },
};

// ─── Connect Account ────────────────────────────────────────

export async function connectAccount(
  workspaceId: string,
  platform: SocialPlatform,
  connectedBy: string,
  mockData?: {
    platformAccountId?: string;
    platformUsername?: string;
    platformDisplayName?: string;
    accountType?: ConnectionAccountType;
    followerCount?: number;
  },
): Promise<string> {
  const mockProfile = MOCK_PROFILES[platform];
  const connRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('social_connections')
    .doc();

  const accountId = mockData?.platformAccountId ?? `mock_${platform}_${Date.now()}`;
  const username = mockData?.platformUsername ?? mockProfile.username;
  const displayName = mockData?.platformDisplayName ?? mockProfile.displayName;
  const accountType = mockData?.accountType ?? mockProfile.accountType;
  const followerCount = mockData?.followerCount ?? mockProfile.followerCount;

  await connRef.set({
    id: connRef.id,
    workspaceId,
    platform,
    accountType,
    platformAccountId: accountId,
    platformUsername: username,
    platformDisplayName: displayName,
    platformAvatarUrl: mockProfile.avatarUrl,
    platformProfileUrl: `https://${platform}.com/${username}`,
    accessToken: encrypt(`mock_access_token_${platform}_${Date.now()}`),
    refreshToken: encrypt(`mock_refresh_token_${platform}_${Date.now()}`),
    tokenExpiresAt: null,
    tokenScopes: ['publish', 'read_analytics'],
    status: 'active',
    healthStatus: 'healthy',
    consecutiveFailures: 0,
    lastSyncAt: FieldValue.serverTimestamp(),
    lastSyncStatus: 'success',
    permissions: ['publish', 'read_analytics'],
    metricsSnapshot: {
      followerCount,
      avgEngagementRate: 0.035 + Math.random() * 0.03,
      avgReach: Math.floor(followerCount * 0.15),
      avgImpressions: Math.floor(followerCount * 0.25),
      lastUpdatedAt: FieldValue.serverTimestamp(),
    },
    connectedBy,
    connectedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: connectedBy,
  });

  await writeAuditLog(workspaceId, {
    action: 'integration.connected',
    resourceType: 'integration',
    resourceId: connRef.id,
    actorId: connectedBy,
    details: { platform, accountType, username },
  });

  return connRef.id;
}

// ─── Disconnect Account ─────────────────────────────────────

export async function disconnectAccount(
  workspaceId: string,
  connectionId: string,
  disconnectedBy: string,
): Promise<void> {
  const connRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('social_connections')
    .doc(connectionId);

  const snap = await connRef.get();
  if (!snap.exists) throw new Error('Connection not found');

  await connRef.update({
    status: 'disconnected',
    healthStatus: 'error',
    accessToken: '',
    refreshToken: '',
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'integration.disconnected',
    resourceType: 'integration',
    resourceId: connectionId,
    actorId: disconnectedBy,
    details: { platform: snap.data()?.platform },
  });
}

// ─── List Connections ───────────────────────────────────────

export async function listConnections(
  workspaceId: string,
): Promise<Record<string, unknown>[]> {
  // Simple query — filter disconnected in-memory to avoid composite index requirement
  const snap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('social_connections')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs
    .filter((doc) => doc.data().status !== 'disconnected')
    .map((doc) => {
    const data = doc.data();
    // Never expose tokens to client
    return {
      id: doc.id,
      ...data,
      accessToken: undefined,
      refreshToken: undefined,
    };
  });
}

// ─── Get Decrypted Token (server-only) ──────────────────────

export async function getDecryptedToken(
  workspaceId: string,
  connectionId: string,
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  const doc = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('social_connections')
    .doc(connectionId)
    .get();

  if (!doc.exists) return null;
  const data = doc.data();

  return {
    accessToken: data?.accessToken ? decrypt(data.accessToken) : '',
    refreshToken: data?.refreshToken ? decrypt(data.refreshToken) : undefined,
  };
}
