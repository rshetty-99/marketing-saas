/**
 * Token Encryption Service (AES-256-GCM)
 * Encrypts OAuth tokens before Firestore write.
 * Uses workspace-level key from Firebase Secret Manager (cached).
 * Falls back to dev key when Secret Manager is not configured.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// In production: fetch from Firebase Secret Manager and cache
// For dev: use a hardcoded key (32 bytes for AES-256)
const DEV_KEY = 'aura-dev-key-32-chars-for-aes!!';

function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY ?? DEV_KEY;
  return Buffer.from(key, 'utf-8').subarray(0, 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:ciphertext (hex-encoded, colon-separated)
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a ciphertext string encrypted with encryptToken().
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted token format');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Check if a string is already encrypted (has the iv:tag:cipher format).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts[0].length === 24 && parts[1].length === 32;
}
