/**
 * Seed entity profiles, flat clients, and enrich members/platform users.
 *
 * Creates:
 *   entity_profiles/{workspaceId}  — 9 profiles (3 freelancer, 3 org, 3 agency)
 *   clients/{clientId}             — 9 enriched client docs (flat top-level)
 *
 * Enriches:
 *   workspaces/{id}/members/{userId} — adds title, department, skills
 *   platform_users/{userId}          — adds title, department, phone
 *   workspaces/{id}                  — adds timezone, locale, primaryEmail
 *
 * Usage:
 *   npx tsx scripts/seed-entity-profiles.ts
 *
 * Prerequisites: Run seed-all-data.ts first to create workspaces/users.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Load .env.local ────────────────────────────────────────────────

function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* ignore */ }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'));

if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) { process.stderr.write('Missing Firebase creds\n'); process.exit(1); }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const now = FieldValue.serverTimestamp();

// ─── Helper: Get all workspace docs ─────────────────────────────────

interface WsDoc {
  id: string;
  name: string;
  accountType: string;
  ownerId: string;
  parentWorkspaceId?: string;
}

async function getWorkspaces(): Promise<WsDoc[]> {
  const snap = await db.collection('workspaces').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WsDoc));
}

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  process.stdout.write('\n=========================================================\n');
  process.stdout.write('  AURA.AI — Seed Entity Profiles + Flat Clients\n');
  process.stdout.write('=========================================================\n\n');

  const workspaces = await getWorkspaces();
  const topLevel = workspaces.filter((w) => !w.parentWorkspaceId);
  const freelancers = topLevel.filter((w) => w.accountType === 'freelancer');
  const orgs = topLevel.filter((w) => w.accountType === 'organization');
  const agencies = topLevel.filter((w) => w.accountType === 'agency');

  process.stdout.write(`Found: ${freelancers.length} freelancers, ${orgs.length} orgs, ${agencies.length} agencies\n\n`);

  // ── 1. Entity Profiles for Freelancers ─────────────────────────────
  process.stdout.write('1. Creating freelancer entity profiles...\n');

  const freelancerProfiles = [
    {
      legalName: 'Alex Freelance Photography LLC',
      phone: '+14155551001',
      website: 'https://alexfreelance.com',
      address: { city: 'San Francisco', state: 'CA', country: 'US', postalCode: '94102' },
      socialLinks: { instagram: '@alexshootsmarketing', linkedin: 'https://linkedin.com/in/alexfreelance', twitter: '@alexfreelance' },
      description: 'Photography-focused marketing freelancer specializing in visual storytelling for lifestyle brands.',
      companySize: 'solo' as const,
      specializations: ['Photography', 'Visual Content', 'Instagram Marketing', 'Brand Storytelling'],
      yearsOfExperience: 7,
      portfolioUrl: 'https://alexfreelance.com/portfolio',
      availabilityStatus: 'available' as const,
      hourlyRate: 12500, rateCurrency: 'USD',
      contentStrategy: { contentPillars: ['visual_storytelling', 'brand_photography', 'behind_the_scenes'], targetAudience: 'DTC lifestyle brands, 50K-5M revenue, female-led', competitorNames: ['VisualMark Studio', 'Snap Creative'], doNotUseWords: ['cheap', 'discount', 'budget'], toneVariations: { instagram: 'playful', linkedin: 'professional' } },
      aiDefaults: { aiCreativityLevel: 'creative' as const, aiDefaultLanguage: 'en', industryJargon: ['lifestyle', 'editorial', 'flat lay', 'UGC'] },
      reporting: { defaultDateRange: 'last_30_days' as const, reportFormat: 'pdf' as const },
    },
    {
      legalName: 'Priya Solo Copywriting',
      phone: '+14155551002',
      website: 'https://priyasolo.com',
      address: { city: 'Austin', state: 'TX', country: 'US', postalCode: '78701' },
      socialLinks: { linkedin: 'https://linkedin.com/in/priyasolo', twitter: '@priya_writes' },
      description: 'Conversion-focused copywriter for SaaS and B2B tech companies.',
      companySize: 'solo' as const,
      specializations: ['Copywriting', 'SaaS', 'B2B', 'Landing Pages', 'Email Sequences'],
      yearsOfExperience: 5,
      portfolioUrl: 'https://priyasolo.com/work',
      availabilityStatus: 'busy' as const,
      hourlyRate: 15000, rateCurrency: 'USD',
      contentStrategy: { contentPillars: ['saas_growth', 'conversion_copywriting', 'email_marketing'], targetAudience: 'B2B SaaS founders, Series A-C, 10-100 employees', doNotUseWords: ['synergy', 'leverage', 'disrupt'], boilerplateOutro: 'Ready to convert more visitors? Let\'s talk.' },
      aiDefaults: { aiCreativityLevel: 'balanced' as const, aiDefaultLanguage: 'en', industryJargon: ['ARR', 'churn', 'onboarding', 'activation'] },
      reporting: { defaultDateRange: 'last_30_days' as const, reportFormat: 'both' as const },
    },
    {
      legalName: 'Marcus Indie Social LLC',
      phone: '+14155551003',
      website: 'https://marcussocial.co',
      address: { city: 'Miami', state: 'FL', country: 'US', postalCode: '33101' },
      socialLinks: { instagram: '@marcus.social', tiktok: '@marcussocial', youtube: 'https://youtube.com/@marcussocial' },
      description: 'Social media strategist helping restaurants and hospitality brands grow on Instagram and TikTok.',
      companySize: 'solo' as const,
      specializations: ['Social Media', 'TikTok', 'Instagram Reels', 'Restaurant Marketing'],
      yearsOfExperience: 4,
      portfolioUrl: 'https://marcussocial.co/case-studies',
      availabilityStatus: 'available' as const,
      hourlyRate: 10000, rateCurrency: 'USD',
      contentStrategy: { contentPillars: ['food_content', 'restaurant_marketing', 'social_growth'], targetAudience: 'Independent restaurants and hospitality brands, 1-10 locations', hashtagSets: { default: ['#restaurantmarketing', '#foodtok', '#socialmediamarketing'] }, toneVariations: { instagram: 'playful', tiktok: 'casual' } },
      aiDefaults: { aiCreativityLevel: 'creative' as const, aiDefaultLanguage: 'en', industryJargon: ['hook', 'trending audio', 'carousel', 'reel'] },
      integrations: { plannedIntegrations: ['instagram', 'tiktok', 'meta_ads'], defaultPostingTimes: { instagram: '11:00', tiktok: '19:00' }, preferredPostingDays: ['tuesday', 'thursday', 'saturday'] },
    },
  ];

  for (let i = 0; i < freelancers.length && i < freelancerProfiles.length; i++) {
    const ws = freelancers[i];
    const profile = freelancerProfiles[i];
    await db.collection('entity_profiles').doc(ws.id).set({
      workspaceId: ws.id,
      accountType: 'freelancer',
      ...profile,
      timezone: 'America/New_York',
      locale: 'en-US',
      createdAt: now, updatedAt: now, createdBy: ws.ownerId,
    });
    await db.collection('workspaces').doc(ws.id).update({ timezone: 'America/New_York', locale: 'en-US', primaryEmail: profile.legalName.toLowerCase().replace(/\s+/g, '') + '@test.dev' });
    process.stdout.write(`  + ${ws.name} → entity_profiles/${ws.id}\n`);
  }

  // ── 2. Entity Profiles for Organizations ───────────────────────────
  process.stdout.write('\n2. Creating organization entity profiles...\n');

  const orgProfiles = [
    {
      legalName: 'Acme Marketing Inc.',
      phone: '+12125551010',
      website: 'https://acmemarketing.com',
      address: { street1: '100 Marketing Ave', city: 'New York', state: 'NY', country: 'US', postalCode: '10001' },
      socialLinks: { linkedin: 'https://linkedin.com/company/acme-marketing', twitter: '@acmemktg' },
      description: 'Full-stack marketing team for a Series B SaaS company.',
      companySize: '51-200' as const, foundedYear: 2018,
      industry: 'Technology', department: 'Marketing', departments: ['Marketing', 'Sales', 'Product', 'Engineering'],
      taxId: 'XX-XXXXXXX', taxIdType: 'ein' as const, businessType: 'corporation' as const,
      contentStrategy: { contentPillars: ['thought_leadership', 'product_updates', 'customer_stories', 'industry_insights'], targetAudience: 'Mid-market SaaS buyers, VP Marketing to CMO, 200-2000 employees', competitorNames: ['HubSpot', 'Marketo', 'Pardot'], doNotUseWords: ['best-in-class', 'cutting-edge'], boilerplateOutro: 'Learn more at acmemarketing.com' },
      aiDefaults: { aiCreativityLevel: 'balanced' as const, aiDefaultLanguage: 'en', industryJargon: ['pipeline', 'MQL', 'SQL', 'ABM', 'demand gen'] },
      campaignBudget: { fiscalYearStart: 1, annualMarketingBudget: 120000000, budgetCurrency: 'USD', budgetAlertThreshold: 80 },
      reporting: { defaultDateRange: 'last_30_days' as const, reportFormat: 'pdf' as const, autoReportSchedule: 'monthly' as const, benchmarkIndustry: 'Technology' },
      integrations: { plannedIntegrations: ['google_analytics', 'google_ads', 'hubspot_crm', 'slack', 'semrush'], contentApprovalDefault: 'multi_stage' as const },
    },
    {
      legalName: 'Bloom Digital Corp.',
      phone: '+14155551020',
      website: 'https://bloomdigital.co',
      address: { street1: '500 Retail Blvd', city: 'Los Angeles', state: 'CA', country: 'US', postalCode: '90001' },
      socialLinks: { instagram: '@bloomdigital', linkedin: 'https://linkedin.com/company/bloomdigital' },
      description: 'Retail brand marketing team focused on e-commerce growth.',
      companySize: '11-50' as const, foundedYear: 2020,
      industry: 'Retail', department: 'Growth', departments: ['Growth', 'Brand', 'Customer Experience'],
      contentStrategy: { contentPillars: ['product_launches', 'seasonal_campaigns', 'customer_reviews', 'influencer_collabs'], targetAudience: 'Fashion-forward millennials and Gen Z, 18-34, urban' },
      aiDefaults: { aiCreativityLevel: 'creative' as const, aiDefaultLanguage: 'en' },
      campaignBudget: { fiscalYearStart: 1, annualMarketingBudget: 50000000, budgetCurrency: 'USD' },
      reporting: { defaultDateRange: 'last_7_days' as const, reportFormat: 'both' as const },
    },
    {
      legalName: 'Nexus Growth Co.',
      phone: '+14425551030',
      website: 'https://nexusgrowth.com',
      address: { street1: '200 Finance Row', city: 'Chicago', state: 'IL', country: 'US', postalCode: '60601' },
      socialLinks: { linkedin: 'https://linkedin.com/company/nexusgrowth', twitter: '@nexusgrowthco' },
      description: 'Financial services marketing team focused on content and thought leadership.',
      companySize: '201-500' as const, foundedYear: 2015,
      industry: 'Finance', department: 'Marketing Communications', departments: ['Marketing Communications', 'Investor Relations', 'Product Marketing'],
      taxId: 'XX-XXXXXXX', taxIdType: 'ein' as const, businessType: 'corporation' as const,
      contentStrategy: { contentPillars: ['market_analysis', 'investment_insights', 'regulatory_updates'], targetAudience: 'CFOs and financial planners, enterprise segment', doNotUseWords: ['guaranteed returns', 'risk-free'], standardDisclaimers: ['Past performance does not guarantee future results.', 'This content is for informational purposes only.'] },
      aiDefaults: { aiCreativityLevel: 'conservative' as const, aiDefaultLanguage: 'en', industryJargon: ['AUM', 'ETF', 'yield curve', 'portfolio allocation'] },
      campaignBudget: { fiscalYearStart: 7, annualMarketingBudget: 200000000, budgetCurrency: 'USD', budgetAlertThreshold: 75 },
      reporting: { defaultDateRange: 'this_month' as const, reportFormat: 'pdf' as const, autoReportSchedule: 'weekly' as const },
    },
  ];

  for (let i = 0; i < orgs.length && i < orgProfiles.length; i++) {
    const ws = orgs[i];
    const profile = orgProfiles[i];
    await db.collection('entity_profiles').doc(ws.id).set({
      workspaceId: ws.id,
      accountType: 'organization',
      ...profile,
      timezone: 'America/New_York',
      locale: 'en-US',
      createdAt: now, updatedAt: now, createdBy: ws.ownerId,
    });
    await db.collection('workspaces').doc(ws.id).update({ timezone: 'America/New_York', locale: 'en-US', primaryEmail: profile.legalName.toLowerCase().replace(/[^a-z]/g, '') + '@test.dev' });
    process.stdout.write(`  + ${ws.name} → entity_profiles/${ws.id}\n`);
  }

  // ── 3. Entity Profiles for Agencies ────────────────────────────────
  process.stdout.write('\n3. Creating agency entity profiles...\n');

  const agencyProfiles = [
    {
      legalName: 'Stellar Agency LLC',
      phone: '+12125552001',
      website: 'https://stellaragency.io',
      address: { street1: '1 Agency Row', city: 'New York', state: 'NY', country: 'US', postalCode: '10010' },
      socialLinks: { linkedin: 'https://linkedin.com/company/stellaragency', instagram: '@stellaragency', twitter: '@stellar_agency' },
      description: 'Full-service digital agency specializing in healthcare, tech, and retail.',
      companySize: '11-50' as const, foundedYear: 2019,
      agencyType: 'full_service' as const,
      specializations: ['Healthcare Marketing', 'Tech Startups', 'Retail Growth'],
      serviceOfferings: ['content_creation', 'social_media', 'seo', 'email', 'ppc', 'branding'],
      industriesServed: ['Healthcare', 'Technology', 'Retail'],
      maxClients: 30,
      whiteLabel: false, reportBranding: 'co_branded' as const,
      contentStrategy: { contentPillars: ['client_success_stories', 'industry_trends', 'how_to_guides'], targetAudience: 'Marketing directors at mid-market companies' },
      aiDefaults: { aiCreativityLevel: 'balanced' as const, aiDefaultLanguage: 'en' },
      campaignBudget: { annualMarketingBudget: 75000000, budgetCurrency: 'USD' },
      integrations: { plannedIntegrations: ['google_analytics', 'meta_ads', 'semrush', 'slack', 'canva'], contentApprovalDefault: 'multi_stage' as const },
    },
    {
      legalName: 'Orbit Media Group Inc.',
      phone: '+13125552002',
      website: 'https://orbitmediagroup.com',
      address: { street1: '200 Media Lane', city: 'Chicago', state: 'IL', country: 'US', postalCode: '60602' },
      socialLinks: { linkedin: 'https://linkedin.com/company/orbitmediagroup', twitter: '@orbitmedia' },
      description: 'Performance marketing agency focused on automotive, fitness, and finance verticals.',
      companySize: '11-50' as const, foundedYear: 2017,
      agencyType: 'performance' as const,
      specializations: ['Performance Marketing', 'PPC', 'Conversion Optimization'],
      serviceOfferings: ['ppc', 'seo', 'email', 'content_creation', 'analytics'],
      industriesServed: ['Automotive', 'Health & Fitness', 'Finance'],
      maxClients: 25,
      whiteLabel: true, reportBranding: 'white_label' as const, hidePoweredByAura: true,
      contentStrategy: { contentPillars: ['data_driven_marketing', 'roi_optimization', 'industry_benchmarks'] },
      aiDefaults: { aiCreativityLevel: 'conservative' as const, aiDefaultLanguage: 'en' },
    },
    {
      legalName: 'Apex Creative Partners LLC',
      phone: '+14155552003',
      website: 'https://apexcreativepartners.com',
      address: { street1: '50 Creative Way', city: 'Portland', state: 'OR', country: 'US', postalCode: '97201' },
      socialLinks: { instagram: '@apexcreative', linkedin: 'https://linkedin.com/company/apexcreative', tiktok: '@apexcreative' },
      description: 'Creative-first agency for education, travel, and manufacturing brands.',
      companySize: '2-10' as const, foundedYear: 2021,
      agencyType: 'creative' as const,
      specializations: ['Brand Identity', 'Visual Content', 'Social Strategy'],
      serviceOfferings: ['branding', 'social_media', 'content_creation', 'video'],
      industriesServed: ['Education', 'Travel', 'Manufacturing'],
      maxClients: 15,
      whiteLabel: false, reportBranding: 'aura' as const,
      contentStrategy: { contentPillars: ['brand_storytelling', 'visual_first', 'authentic_voices'], toneVariations: { instagram: 'playful', linkedin: 'professional', tiktok: 'casual' } },
      aiDefaults: { aiCreativityLevel: 'creative' as const, aiDefaultLanguage: 'en' },
    },
  ];

  for (let i = 0; i < agencies.length && i < agencyProfiles.length; i++) {
    const ws = agencies[i];
    const profile = agencyProfiles[i];
    await db.collection('entity_profiles').doc(ws.id).set({
      workspaceId: ws.id,
      accountType: 'agency',
      ...profile,
      timezone: 'America/New_York',
      locale: 'en-US',
      createdAt: now, updatedAt: now, createdBy: ws.ownerId,
    });
    await db.collection('workspaces').doc(ws.id).update({ timezone: 'America/New_York', locale: 'en-US', primaryEmail: profile.legalName.toLowerCase().replace(/[^a-z]/g, '') + '@test.dev' });
    process.stdout.write(`  + ${ws.name} → entity_profiles/${ws.id}\n`);
  }

  // ── 4. Flat Client Collection ──────────────────────────────────────
  process.stdout.write('\n4. Creating flat clients/ collection...\n');

  // Clean old flat clients if any
  const existingClients = await db.collection('clients').get();
  if (!existingClients.empty) {
    const batch = db.batch();
    for (const doc of existingClients.docs) batch.delete(doc.ref);
    await batch.commit();
  }

  // Gather existing client data from subcollections
  for (const agency of agencies) {
    const clientSnap = await db.collection('workspaces').doc(agency.id).collection('clients').get();

    for (const clientDoc of clientSnap.docs) {
      const oldData = clientDoc.data();
      const clientName = oldData.name || oldData.clientName || clientDoc.id;
      const slug = clientName.toLowerCase().replace(/\s+/g, '-');

      await db.collection('clients').doc(clientDoc.id).set({
        clientId: clientDoc.id,
        agencyWorkspaceId: agency.id,
        clerkOrgId: oldData.clerkOrgId || oldData.subWorkspaceId || '',
        childWorkspaceId: oldData.childWorkspaceId || oldData.subWorkspaceId || '',
        name: clientName,
        clientCode: `${slug.substring(0, 4).toUpperCase()}-001`,
        industry: oldData.industry || 'Technology',
        website: `https://${slug}.example.com`,
        description: `${clientName} is a valued client of ${agency.name}.`,

        primaryContact: {
          name: oldData.contactEmail ? oldData.contactEmail.split('@')[0] : 'Contact',
          email: oldData.contactEmail || `contact@${slug}.example.com`,
          phone: '+15555550000',
          title: 'Marketing Director',
        },
        address: { city: 'New York', state: 'NY', country: 'US' },
        socialAccounts: [
          { platform: 'linkedin', handle: `@${slug}`, url: `https://linkedin.com/company/${slug}` },
          { platform: 'instagram', handle: `@${slug}` },
        ],

        status: 'active',
        lifecycleStage: 'active_client',
        healthScore: 75 + Math.floor(Math.random() * 20),
        healthStatus: 'green',
        clientSince: now,
        riskLevel: 'low',

        billingModel: 'retainer',
        retainerAmount: 500000 + Math.floor(Math.random() * 500000), // $5k-$10k
        retainerCurrency: 'USD',
        billingCycle: 'monthly',
        paymentTerms: 'net_30',
        autoRenew: true,

        servicesProvided: ['content_creation', 'social_media', 'seo'],
        platforms: ['instagram', 'linkedin', 'facebook'],
        contentTypes: ['social_posts', 'blog_posts'],
        monthlyContentQuota: 20 + Math.floor(Math.random() * 30),

        brand: {
          brandName: clientName,
          brandVoiceTone: 'professional',
          contentPillars: ['brand_updates', 'thought_leadership'],
        },

        assignedTeamMemberIds: oldData.assignedTeamMembers || oldData.assignedTeamMemberIds || [agency.ownerId],
        accountManagerId: agency.ownerId,
        portalEnabled: false,
        tags: ['active'],
        source: 'manual',

        createdAt: now,
        updatedAt: now,
        createdBy: agency.ownerId,
      });

      process.stdout.write(`  + clients/${clientDoc.id} (${clientName}) → agency ${agency.name}\n`);
    }
  }

  // ── 5. Enrich Members ──────────────────────────────────────────────
  process.stdout.write('\n5. Enriching workspace members...\n');

  const memberTitles: Record<string, { title: string; department: string; skills: string[] }> = {
    owner: { title: 'Founder & CEO', department: 'Leadership', skills: ['strategy', 'leadership', 'branding'] },
    admin: { title: 'Operations Manager', department: 'Operations', skills: ['project_management', 'analytics', 'integrations'] },
    manager: { title: 'Campaign Manager', department: 'Marketing', skills: ['campaign_management', 'social_media', 'analytics'] },
    editor: { title: 'Content Strategist', department: 'Content', skills: ['copywriting', 'seo', 'social_media', 'email'] },
    viewer: { title: 'Analytics Analyst', department: 'Analytics', skills: ['data_analysis', 'reporting', 'visualization'] },
  };

  let enrichedMembers = 0;
  for (const ws of topLevel) {
    const memberSnap = await db.collection('workspaces').doc(ws.id).collection('members').get();
    for (const memberDoc of memberSnap.docs) {
      const data = memberDoc.data();
      const roleInfo = memberTitles[data.role] || memberTitles.editor;
      await memberDoc.ref.update({
        title: roleInfo.title,
        department: roleInfo.department,
        skills: roleInfo.skills,
        timezone: 'America/New_York',
        weeklyCapacityHours: 40,
        preferences: { emailNotifications: true, inAppNotifications: true, weeklyDigest: false },
        updatedAt: now,
      });
      enrichedMembers++;
    }
  }
  process.stdout.write(`  + Enriched ${enrichedMembers} members\n`);

  // ── 6. Enrich Platform Users ───────────────────────────────────────
  process.stdout.write('\n6. Enriching platform users...\n');

  const platformTitles: Record<string, { title: string; department: string }> = {
    super_admin: { title: 'Co-Founder & CTO', department: 'Engineering' },
    platform_admin: { title: 'Head of Platform Ops', department: 'Engineering' },
    partner_manager: { title: 'Director of Partnerships', department: 'Business Development' },
    operations: { title: 'Operations Lead', department: 'Operations' },
    finance: { title: 'Finance Manager', department: 'Finance' },
    support: { title: 'Senior Support Engineer', department: 'Customer Success' },
    content_moderator: { title: 'Trust & Safety Lead', department: 'Trust & Safety' },
    analyst: { title: 'Platform Analyst', department: 'Data & Analytics' },
  };

  const platformSnap = await db.collection('platform_users').get();
  let enrichedPlatform = 0;
  for (const doc of platformSnap.docs) {
    const data = doc.data();
    const info = platformTitles[data.role] || { title: 'Team Member', department: 'General' };
    await doc.ref.update({
      title: info.title,
      department: info.department,
      timezone: 'America/New_York',
      preferences: { emailNotifications: true, slackNotifications: false, darkMode: false },
      updatedAt: now,
    });
    enrichedPlatform++;
  }
  process.stdout.write(`  + Enriched ${enrichedPlatform} platform users\n`);

  // ── Summary ────────────────────────────────────────────────────────
  process.stdout.write('\n=========================================================\n');
  process.stdout.write('  SEED COMPLETE\n');
  process.stdout.write('=========================================================\n\n');
  process.stdout.write(`  entity_profiles/       — ${freelancers.length + orgs.length + agencies.length} docs\n`);
  process.stdout.write(`  clients/               — ${await db.collection('clients').get().then(s => s.size)} docs (flat)\n`);
  process.stdout.write(`  members enriched       — ${enrichedMembers}\n`);
  process.stdout.write(`  platform_users enriched — ${enrichedPlatform}\n`);
  process.stdout.write('\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`\nSeed failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
