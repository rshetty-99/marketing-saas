'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function GDPRPage() {
  return (
    <LegalPageLayout title="GDPR Compliance" lastUpdated="March 15, 2026">
      <p>
        Aura.ai (&quot;Aura&quot;) is committed to complying with the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;) and the UK GDPR. This page describes how we process personal data in accordance with these regulations and outlines your rights as a data subject.
      </p>

      <h2>Our Commitment</h2>
      <p>
        We have implemented comprehensive data protection measures across our platform, including privacy by design principles, data minimization, purpose limitation, and transparent processing. Our platform is built with workspace isolation, encrypted data storage, and granular access controls to protect personal data at every layer.
      </p>
      <p>
        We regularly review and update our data protection practices to ensure continued compliance with GDPR requirements and evolving regulatory guidance.
      </p>

      <h2>Data Controller</h2>
      <p>
        For personal data processed in connection with your use of the Aura platform, the data controller is:
      </p>
      <ul>
        <li><strong>Entity:</strong> Aura Technologies Inc.</li>
        <li><strong>Address:</strong> 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
        <li><strong>Email:</strong> <a href="mailto:privacy@aura.ai">privacy@aura.ai</a></li>
      </ul>
      <p>
        When you use Aura to process personal data of your own customers or contacts (e.g., email subscriber lists, lead data, social media audience data), you are the data controller and Aura acts as a data processor. In this case, our Data Processing Agreement governs the relationship.
      </p>

      <h2>Legal Basis for Processing</h2>
      <p>We process personal data under the following legal bases:</p>
      <ul>
        <li><strong>Contract performance (Art. 6(1)(b)):</strong> Processing necessary to provide the Aura platform services, manage your account, process payments, and deliver features you have subscribed to.</li>
        <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> Platform security, fraud prevention, service improvement, and aggregated analytics. We balance these interests against your rights and freedoms.</li>
        <li><strong>Consent (Art. 6(1)(a)):</strong> Marketing communications, optional analytics cookies, and newsletter subscriptions. You may withdraw consent at any time.</li>
        <li><strong>Legal obligation (Art. 6(1)(c)):</strong> Tax records, billing data retention, and compliance with regulatory requests.</li>
      </ul>

      <h2>Data Subject Rights</h2>
      <p>
        Under the GDPR, you have the following rights regarding your personal data. To exercise any of these rights, contact us at <a href="mailto:privacy@aura.ai">privacy@aura.ai</a>. We will respond within 30 days.
      </p>

      <h3>Right of access</h3>
      <p>
        You have the right to obtain confirmation of whether we process your personal data and to request a copy of that data. You can also access and export your data directly through your account settings.
      </p>

      <h3>Right to erasure</h3>
      <p>
        You have the right to request deletion of your personal data. Upon receiving a valid erasure request, we will delete your data within 30 days, except where retention is required by law (e.g., billing records) or necessary to resolve ongoing disputes.
      </p>

      <h3>Right to data portability</h3>
      <p>
        You have the right to receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV). This includes content, analytics data, contact lists, and account information.
      </p>

      <h3>Right to rectification</h3>
      <p>
        You have the right to correct inaccurate personal data. You can update most information directly through the platform. For data that cannot be self-edited, contact our support team.
      </p>

      <h3>Right to restriction of processing</h3>
      <p>
        You have the right to request that we restrict processing of your personal data in certain circumstances, such as while we verify the accuracy of contested data or evaluate an objection request.
      </p>

      <h3>Right to object</h3>
      <p>
        You have the right to object to processing based on legitimate interests. Upon receiving an objection, we will cease processing unless we demonstrate compelling legitimate grounds that override your interests, rights, and freedoms.
      </p>

      <h2>Data Processing</h2>
      <p>We process the following categories of personal data for the purposes described:</p>
      <ul>
        <li><strong>Account data</strong> (name, email, organization): Account management, authentication, billing</li>
        <li><strong>Usage data</strong> (feature interactions, timestamps): Platform improvement, support</li>
        <li><strong>Content data</strong> (posts, campaigns, images): Service delivery, AI content generation</li>
        <li><strong>Social media data</strong> (profile info, metrics): Publishing, analytics reporting</li>
        <li><strong>Technical data</strong> (IP, browser, device): Security, fraud prevention</li>
      </ul>

      <h2>International Transfers</h2>
      <p>
        Aura processes data primarily within the United States using Google Cloud Platform infrastructure. For transfers of personal data from the EU/EEA to the US, we rely on:
      </p>
      <ul>
        <li>The EU-U.S. Data Privacy Framework (DPF) where applicable</li>
        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        <li>Supplementary technical measures including encryption and access controls</li>
      </ul>
      <p>
        Google Cloud Platform (our infrastructure provider) participates in the EU-U.S. Data Privacy Framework and maintains standard contractual clauses for data transfers.
      </p>

      <h2>Sub-Processors</h2>
      <p>We use the following sub-processors to deliver our services:</p>
      <ul>
        <li><strong>Google Cloud Platform / Firebase</strong> (USA) — Infrastructure, database, storage, serverless compute</li>
        <li><strong>Clerk</strong> (USA) — Authentication and identity management</li>
        <li><strong>Stripe</strong> (USA) — Payment processing and subscription management</li>
        <li><strong>Anthropic (Claude AI)</strong> (USA) — AI content generation</li>
        <li><strong>Google (Vertex AI)</strong> (USA) — Image generation</li>
        <li><strong>Social media platforms</strong> (various) — Content publishing and analytics retrieval</li>
      </ul>
      <p>
        We maintain contracts with all sub-processors that include GDPR-compliant data processing terms. We will notify you of any changes to our sub-processor list with at least 30 days advance notice.
      </p>

      <h2>Data Retention</h2>
      <p>We retain personal data only as long as necessary for the purposes for which it was collected:</p>
      <ul>
        <li><strong>Account data:</strong> Duration of account plus 30 days post-termination</li>
        <li><strong>Content and analytics:</strong> 24 months after account closure</li>
        <li><strong>Billing records:</strong> 7 years (legal requirement)</li>
        <li><strong>Security logs:</strong> 12 months</li>
        <li><strong>Marketing consent records:</strong> 3 years after last interaction</li>
      </ul>

      <h2>Data Protection Officer</h2>
      <p>
        Our Data Protection Officer can be contacted for any GDPR-related inquiries:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:dpo@aura.ai">dpo@aura.ai</a></li>
        <li><strong>Address:</strong> Aura Technologies Inc., Attn: Data Protection Officer, 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
      </ul>

      <h2>Complaints</h2>
      <p>
        If you believe your data protection rights have been violated, you have the right to lodge a complaint with a supervisory authority in the EU member state of your habitual residence, place of work, or place of the alleged infringement.
      </p>
      <p>
        We encourage you to contact us first at <a href="mailto:dpo@aura.ai">dpo@aura.ai</a> so we can attempt to resolve the issue directly.
      </p>
    </LegalPageLayout>
  );
}
