'use client';

import { motion } from 'framer-motion';
import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';
import { Shield, Lock, Key, Users, Eye, Bug, Award, Mail } from 'lucide-react';

const SECURITY_BADGES = [
  { icon: Shield, label: 'AES-256-GCM', desc: 'Encryption at rest' },
  { icon: Lock, label: 'TLS 1.3', desc: 'Encryption in transit' },
  { icon: Key, label: 'MFA', desc: 'Multi-factor auth' },
  { icon: Users, label: 'RBAC', desc: 'Role-based access' },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function SecurityPage() {
  return (
    <LegalPageLayout title="Security" lastUpdated="March 15, 2026">
      {/* Security badges grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 not-prose"
      >
        {SECURITY_BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.label}
              variants={fadeUp}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-orange flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-ui font-medium">{badge.label}</span>
              <span className="text-xs text-muted-foreground">{badge.desc}</span>
            </motion.div>
          );
        })}
      </motion.div>

      <p>
        Security is foundational to the Aura platform. As a marketing SaaS handling social media credentials, client data, and AI-generated content, we design every layer of our infrastructure with security as a first-class requirement.
      </p>

      <h2>Infrastructure</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Shield className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">Google Cloud Platform + Firebase</p>
          <p className="text-sm text-muted-foreground">All infrastructure runs on GCP with SOC 1/2/3, ISO 27001, and PCI DSS certifications.</p>
        </div>
      </div>
      <p>
        Aura is hosted on Firebase App Hosting backed by Google Cloud Platform. Our infrastructure benefits from GCP&apos;s world-class physical security, network isolation, and compliance certifications. All data is stored in Firestore with automatic replication across multiple availability zones.
      </p>
      <p>
        We use Firebase Cloud Functions for serverless compute, Cloud Tasks for background job processing, and Cloud Scheduler for automated maintenance operations. All services communicate over private internal networks.
      </p>

      <h2>Data Encryption</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Lock className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">AES-256-GCM at rest, TLS 1.3 in transit</p>
          <p className="text-sm text-muted-foreground">All sensitive data is encrypted before storage. All network traffic uses TLS.</p>
        </div>
      </div>
      <p>
        All data stored in Firestore is encrypted at rest using Google-managed encryption keys (AES-256). Sensitive data such as OAuth tokens and API credentials receive an additional layer of application-level encryption using AES-256-GCM with workspace-specific keys before being written to the database.
      </p>
      <p>
        All data in transit is encrypted using TLS 1.3. We enforce HTTPS across all endpoints and reject non-encrypted connections. API communications with third-party services (social media platforms, payment processors, AI providers) also use TLS.
      </p>

      <h2>Authentication</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Key className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">Clerk Authentication with MFA</p>
          <p className="text-sm text-muted-foreground">Enterprise-grade auth with multi-factor authentication and session management.</p>
        </div>
      </div>
      <p>
        We use Clerk for authentication, providing secure email/password login, social sign-in (Google, GitHub), and multi-factor authentication (TOTP and SMS). Sessions are managed with short-lived JWTs and automatic rotation.
      </p>
      <p>
        Password policies enforce minimum complexity requirements. Failed login attempts are rate-limited and monitored. Account recovery follows secure email verification flows with time-limited tokens.
      </p>

      <h2>Access Control</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Users className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">RBAC with Workspace Isolation</p>
          <p className="text-sm text-muted-foreground">14 roles across 3 scopes. No cross-workspace data access. Ever.</p>
        </div>
      </div>
      <p>
        Aura implements a comprehensive role-based access control (RBAC) system with 14 distinct roles across workspace, platform, and client portal scopes. Every API route checks user permissions before processing requests.
      </p>
      <p>
        Workspace isolation is enforced at the database level. Firestore security rules ensure that queries can only access data within the authenticated user&apos;s workspace. For agency accounts managing clients, dual-scope filters (workspace ID + client ID) prevent cross-client data leakage.
      </p>

      <h2>OAuth Token Security</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Eye className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">Encrypted Token Storage</p>
          <p className="text-sm text-muted-foreground">Social media tokens are never stored in plain text or returned in API responses.</p>
        </div>
      </div>
      <p>
        When you connect social media accounts, the OAuth access and refresh tokens are encrypted using AES-256-GCM with a workspace-specific encryption key before being stored in Firestore. Tokens are decrypted only at the moment of use for publishing or analytics retrieval.
      </p>
      <p>
        API responses listing connected accounts never include token values. Token refresh operations are handled by automated Cloud Functions that decrypt, refresh, re-encrypt, and store updated tokens. Disconnecting an account immediately deletes all associated tokens.
      </p>

      <h2>Vulnerability Disclosure</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Bug className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">Responsible Disclosure Program</p>
          <p className="text-sm text-muted-foreground">We welcome security researchers and reward responsible disclosures.</p>
        </div>
      </div>
      <p>
        We maintain a responsible vulnerability disclosure program. If you discover a security vulnerability, please report it to <a href="mailto:security@aura.ai">security@aura.ai</a>. We ask that you:
      </p>
      <ul>
        <li>Provide sufficient detail to reproduce the vulnerability</li>
        <li>Allow reasonable time for us to investigate and remediate before public disclosure</li>
        <li>Do not access or modify other users&apos; data</li>
        <li>Do not perform denial-of-service testing</li>
      </ul>
      <p>
        We acknowledge all reports within 24 hours and provide status updates throughout the remediation process.
      </p>

      <h2>SOC 2 Compliance</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Award className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">SOC 2 Type II — In Progress</p>
          <p className="text-sm text-muted-foreground">We are actively pursuing SOC 2 Type II certification. Expected completion: Q3 2026.</p>
        </div>
      </div>
      <p>
        Aura is actively working toward SOC 2 Type II certification covering the Security, Availability, and Confidentiality trust service criteria. Our underlying infrastructure (GCP/Firebase) already holds SOC 2 Type II certification.
      </p>
      <p>
        We maintain internal security policies covering access management, incident response, change management, and vendor risk assessment that align with SOC 2 requirements.
      </p>

      <h2>Contact</h2>
      <div className="not-prose flex items-start gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
        <Mail className="w-5 h-5 text-brand-orange mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-ui font-medium mb-1">Security Team</p>
          <p className="text-sm text-muted-foreground">Reach our security team for any concerns or questions.</p>
        </div>
      </div>
      <p>
        For security-related inquiries, contact us at <a href="mailto:security@aura.ai">security@aura.ai</a>. For general privacy questions, contact <a href="mailto:privacy@aura.ai">privacy@aura.ai</a>.
      </p>
    </LegalPageLayout>
  );
}
