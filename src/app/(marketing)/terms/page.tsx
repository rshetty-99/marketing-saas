'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="March 15, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Aura.ai platform, services, and applications (the &quot;Platform&quot;) operated by Aura Technologies Inc. (&quot;Aura&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using the Platform, you agree to be bound by these Terms.
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By creating an account or using the Platform, you represent that you are at least 18 years old and have the legal capacity to enter into a binding agreement. If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
      </p>
      <p>
        We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Platform. Your continued use after such notice constitutes acceptance of the modified Terms.
      </p>

      <h2>Account Terms</h2>
      <p>
        You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate and complete registration information and keep it up to date.
      </p>
      <ul>
        <li>Each user must have a unique account. Account sharing is not permitted.</li>
        <li>You are responsible for all actions taken through your account, including content published to connected social media platforms.</li>
        <li>You must immediately notify us at <a href="mailto:security@aura.ai">security@aura.ai</a> if you suspect unauthorized access to your account.</li>
        <li>We reserve the right to suspend accounts that violate these Terms or pose a security risk.</li>
      </ul>

      <h2>Subscription and Billing</h2>
      <p>
        The Platform is available under multiple subscription tiers (Starter, Growth, and Agency). Each tier includes specific features, usage limits, and pricing as described on our pricing page.
      </p>
      <ul>
        <li>Free trials last 15 days with full feature access subject to usage caps.</li>
        <li>Subscriptions are billed monthly or annually in advance via Stripe. Per-seat charges apply based on the number of active workspace members.</li>
        <li>You may upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades take effect at the end of the current billing period.</li>
        <li>Refunds are not provided for partial billing periods. You may cancel at any time, and your access will continue until the end of the paid period.</li>
        <li>We reserve the right to adjust pricing with 30 days advance notice.</li>
      </ul>

      <h2>Acceptable Use</h2>
      <p>You agree not to use the Platform to:</p>
      <ul>
        <li>Violate any applicable law, regulation, or third-party rights</li>
        <li>Generate, publish, or distribute content that is unlawful, defamatory, harassing, or fraudulent</li>
        <li>Send unsolicited commercial messages (spam) through email or social publishing features</li>
        <li>Attempt to gain unauthorized access to other accounts, workspaces, or Platform systems</li>
        <li>Reverse engineer, decompile, or attempt to extract the source code of the Platform</li>
        <li>Use automated means (bots, scrapers) to access the Platform except through our official API</li>
        <li>Interfere with the Platform&apos;s operation or impose unreasonable load on our infrastructure</li>
        <li>Misrepresent AI-generated content as human-created in jurisdictions that require disclosure</li>
      </ul>

      <h2>AI Content Ownership</h2>
      <p>
        Content generated through our AI features is owned by you, subject to the following conditions:
      </p>
      <ul>
        <li>You retain all rights to content you create or generate using the Platform.</li>
        <li>You grant Aura a limited, non-exclusive license to process, store, and display your content as necessary to provide the Platform&apos;s services.</li>
        <li>AI-generated content is provided &quot;as is.&quot; You are responsible for reviewing all AI output before publication and ensuring it complies with applicable laws and platform policies.</li>
        <li>We do not guarantee that AI-generated content is original, accurate, or free from bias. You accept full responsibility for any content you publish.</li>
      </ul>

      <h2>Social Media Publishing</h2>
      <p>
        When you use Aura to publish content to connected social media accounts, you acknowledge that:
      </p>
      <ul>
        <li>Published content is subject to the terms of service of each respective social media platform.</li>
        <li>Aura is not responsible for actions taken by social media platforms (e.g., content removal, account suspension) in response to content published through our Platform.</li>
        <li>You are solely responsible for ensuring that published content complies with all applicable advertising disclosure requirements, including FTC guidelines.</li>
        <li>Scheduling and auto-publishing features execute at the specified time. You are responsible for reviewing and approving scheduled content before publication.</li>
      </ul>

      <h2>Data Ownership</h2>
      <p>
        You retain ownership of all data you upload to or create within the Platform (&quot;Customer Data&quot;). This includes content, brand assets, client information, contact lists, and analytics configurations.
      </p>
      <ul>
        <li>You may export your Customer Data at any time through the Platform or by contacting support.</li>
        <li>Upon account termination, we will retain your Customer Data for 30 days to allow for export, after which it will be permanently deleted unless legally required to retain it.</li>
        <li>For agencies: client data within your workspace is your responsibility. You must have appropriate agreements with your clients regarding data handling.</li>
      </ul>

      <h2>Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, AURA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE PLATFORM.
      </p>
      <p>
        OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO AURA IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
      </p>
      <p>
        Some jurisdictions do not allow the exclusion of implied warranties or limitation of liability for certain damages. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
      </p>

      <h2>Termination</h2>
      <p>
        You may terminate your account at any time through your account settings. We may suspend or terminate your account if you violate these Terms, pose a security risk, or if your subscription payment fails after reasonable notice.
      </p>
      <p>
        Upon termination, your right to access the Platform ceases immediately. Provisions that by their nature should survive termination (including ownership, limitation of liability, and dispute resolution) shall survive.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in New York County, New York.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these Terms, please contact us:
      </p>
      <ul>
        <li>Email: <a href="mailto:legal@aura.ai">legal@aura.ai</a></li>
        <li>Address: Aura Technologies Inc., 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
      </ul>
    </LegalPageLayout>
  );
}
