/**
 * Marketing AI Features — Types
 * Website Auditor, Content Calendar Generator, Launch Playbook,
 * Client Proposal Generator, Email Sequence Generator.
 */

import type { FirestoreTimestamp } from './f0';

// ═══════════════════════════════════════════════════════════
// WEBSITE MARKETING AUDITOR
// ═══════════════════════════════════════════════════════════

export interface AuditDimension {
  name: string;
  score: number;                      // 0-100
  weight: number;                     // 0-1
  findings: string[];
  recommendations: string[];
}

export interface WebsiteAudit {
  id: string;
  workspaceId: string;
  url: string;
  overallScore: number;
  dimensions: {
    content: AuditDimension;          // Copy quality, value props, headlines, CTAs
    conversion: AuditDimension;       // Funnels, forms, social proof, urgency
    seo: AuditDimension;              // On-page/technical SEO, structure
    competitive: AuditDimension;      // Differentiation, positioning
    brand: AuditDimension;            // Design quality, trust signals, authority
    growth: AuditDimension;           // Pricing, acquisition channels, retention
  };
  summary: string;
  topPriorities: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// 30-DAY CONTENT CALENDAR GENERATOR
// ═══════════════════════════════════════════════════════════

export interface CalendarPlanDay {
  date: string;                       // ISO date
  dayOfWeek: string;
  posts: {
    platform: string;
    contentType: string;
    topic: string;
    caption: string;
    hashtags: string[];
    bestTime: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text' | 'story';
  }[];
}

export interface ContentCalendarPlan {
  id: string;
  workspaceId: string;
  name: string;
  businessType: string;
  goals: string[];
  platforms: string[];
  postsPerWeek: number;
  totalPosts: number;
  days: CalendarPlanDay[];
  themes: string[];                   // Weekly themes
  status: 'generating' | 'completed' | 'applied';
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// PRODUCT LAUNCH PLAYBOOK
// ═══════════════════════════════════════════════════════════

export interface LaunchPhase {
  name: string;                       // e.g., "Pre-Launch", "Launch Week", "Post-Launch"
  durationDays: number;
  tasks: {
    task: string;
    channel: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    owner: string;
    details: string;
  }[];
}

export interface LaunchPlaybook {
  id: string;
  workspaceId: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  launchDate: string;
  budget: string;
  phases: LaunchPhase[];
  emailSequence: { subject: string; sendDay: number; purpose: string }[];
  socialPosts: { platform: string; content: string; scheduledDay: number }[];
  adStrategy: { platform: string; budget: string; targeting: string; creativeType: string }[];
  kpis: { metric: string; target: string }[];
  status: 'draft' | 'active' | 'completed';
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// CLIENT PROPOSAL GENERATOR
// ═══════════════════════════════════════════════════════════

export interface ProposalSection {
  title: string;
  content: string;
}

export interface ClientProposal {
  id: string;
  workspaceId: string;
  clientName: string;
  clientIndustry: string;
  services: string[];
  monthlyBudget: string;
  duration: string;
  sections: ProposalSection[];
  deliverables: { item: string; frequency: string; description: string }[];
  pricing: { item: string; price: string; details: string }[];
  timeline: { phase: string; duration: string; deliverables: string[] }[];
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: FirestoreTimestamp;
  createdBy: string;
}

// ═══════════════════════════════════════════════════════════
// EMAIL SEQUENCE GENERATOR
// ═══════════════════════════════════════════════════════════

export type SequenceType = 'welcome' | 'nurture' | 'launch' | 'onboarding' | 're_engagement' | 'upsell';

export interface EmailSequenceStep {
  stepNumber: number;
  subject: string;
  previewText: string;
  body: string;
  sendDelay: string;                  // e.g., "immediately", "day 1", "day 3"
  purpose: string;
  cta: string;
}

export interface EmailSequence {
  id: string;
  workspaceId: string;
  name: string;
  sequenceType: SequenceType;
  topic: string;
  targetAudience: string;
  steps: EmailSequenceStep[];
  totalEmails: number;
  estimatedDuration: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: FirestoreTimestamp;
  createdBy: string;
}
