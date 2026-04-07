'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function GDPRPage() {
  return (
    <LegalPageLayout
      title="GDPR Compliance"
      subtitle="Our commitment to data protection under the EU General Data Protection Regulation."
      lastUpdated="March 15, 2026"
      effectiveDate="March 15, 2026"
      version="v2.0"
    >
      <div className="legal-highlight">
        <p>
          <strong>Summary:</strong> Aura acts as a data processor. You are the data controller. We support
          all GDPR data subject rights. Data subject requests can be submitted through the platform.
        </p>
      </div>

      <h2>Our Commitment</h2>

      <h3>Privacy by design</h3>
      <p>
        Aura.ai (&quot;Aura&quot;) is committed to full compliance with the General Data Protection
        Regulation (EU) 2016/679 (&quot;GDPR&quot;) and the UK GDPR. We have embedded data protection
        principles into every layer of our platform architecture, from database design to API endpoints
        to user interfaces. Our engineering practices follow privacy by design and privacy by default
        principles, meaning that data protection is not an afterthought but a foundational requirement
        of every feature we build.
      </p>

      <h3>Continuous compliance</h3>
      <p>
        We regularly review and update our data protection practices to ensure continued compliance with
        evolving GDPR guidance, European Data Protection Board (EDPB) opinions, and national supervisory
        authority decisions. Our compliance program includes annual internal audits, quarterly policy
        reviews, and ongoing monitoring of regulatory developments. All employees with access to personal
        data receive mandatory data protection training upon hire and annually thereafter.
      </p>

      <h3>Technical safeguards</h3>
      <p>
        Our platform is built with workspace isolation, AES-256-GCM encrypted data storage, role-based
        access controls (14 roles across 3 scopes), and granular audit logging. Personal data is minimized
        at collection, purpose-limited in processing, and subject to configurable retention periods. Our
        blog analytics system uses privacy-safe hashed visitor identifiers with daily rotating salts instead
        of cookies or fingerprinting.
      </p>

      <h2>Roles and Responsibilities</h2>

      <h3>Aura as data controller</h3>
      <p>
        For personal data processed in connection with your Aura account (e.g., your name, email address,
        billing information, and platform usage data), Aura Technologies Inc. acts as the data controller.
        The controller entity is:
      </p>
      <ul>
        <li><strong>Entity:</strong> Aura Technologies Inc.</li>
        <li><strong>Address:</strong> 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
        <li><strong>Email:</strong> <a href="mailto:privacy@aura.ai">privacy@aura.ai</a></li>
        <li><strong>DPO:</strong> <a href="mailto:dpo@aura.ai">dpo@aura.ai</a></li>
      </ul>

      <h3>Aura as data processor</h3>
      <p>
        When you use Aura to process personal data of your own customers, clients, contacts, or subscribers
        (e.g., email subscriber lists, lead form submissions, CRM contacts, social media audience data),
        you are the data controller and Aura acts as a data processor. In this capacity, we process personal
        data only on your documented instructions and in accordance with our{' '}
        <a href="/dpa">Data Processing Agreement</a>. We do not independently determine the purposes or
        means of processing your customers&apos; data.
      </p>

      <h3>Agency-client relationships</h3>
      <p>
        For agencies managing client accounts on Aura, the agency typically acts as a data processor for
        their clients (the data controllers). Aura acts as a sub-processor in this chain. We enforce
        strict workspace and client isolation at the database level, ensuring that each client&apos;s data
        is accessible only to authorized users within the correct workspace scope. Agencies are responsible
        for maintaining appropriate data processing agreements with their own clients.
      </p>

      <h2>Legal Basis for Processing</h2>

      <h3>Lawfulness of processing</h3>
      <p>
        We process personal data only when we have a valid legal basis under Article 6 of the GDPR. The
        specific legal basis depends on the context and purpose of processing. We document the legal basis
        for each processing activity in our Records of Processing Activities (ROPA), which is available
        to supervisory authorities upon request.
      </p>

      <table>
        <thead>
          <tr>
            <th>Processing Purpose</th>
            <th>Legal Basis</th>
            <th>GDPR Article</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account creation and management</td>
            <td>Contract performance</td>
            <td>Art. 6(1)(b)</td>
          </tr>
          <tr>
            <td>Platform service delivery</td>
            <td>Contract performance</td>
            <td>Art. 6(1)(b)</td>
          </tr>
          <tr>
            <td>Subscription billing and invoicing</td>
            <td>Contract performance</td>
            <td>Art. 6(1)(b)</td>
          </tr>
          <tr>
            <td>AI content generation</td>
            <td>Contract performance</td>
            <td>Art. 6(1)(b)</td>
          </tr>
          <tr>
            <td>Social media publishing</td>
            <td>Contract performance</td>
            <td>Art. 6(1)(b)</td>
          </tr>
          <tr>
            <td>Platform security and fraud prevention</td>
            <td>Legitimate interest</td>
            <td>Art. 6(1)(f)</td>
          </tr>
          <tr>
            <td>Service improvement and analytics</td>
            <td>Legitimate interest</td>
            <td>Art. 6(1)(f)</td>
          </tr>
          <tr>
            <td>Marketing communications</td>
            <td>Consent</td>
            <td>Art. 6(1)(a)</td>
          </tr>
          <tr>
            <td>Newsletter subscriptions</td>
            <td>Consent (double opt-in)</td>
            <td>Art. 6(1)(a)</td>
          </tr>
          <tr>
            <td>Tax records and billing retention</td>
            <td>Legal obligation</td>
            <td>Art. 6(1)(c)</td>
          </tr>
          <tr>
            <td>Regulatory compliance responses</td>
            <td>Legal obligation</td>
            <td>Art. 6(1)(c)</td>
          </tr>
        </tbody>
      </table>

      <h2>Data Subject Rights</h2>

      <h3>How to exercise your rights</h3>
      <p>
        Under the GDPR, you have comprehensive rights regarding your personal data. To exercise any of
        these rights, you can submit a data subject request through the Compliance page in your workspace
        dashboard, or contact us directly at <a href="mailto:privacy@aura.ai">privacy@aura.ai</a>. We
        verify the identity of all requestors before processing requests. We will respond to all verified
        requests within 30 days. If a request is complex or we receive a high volume of requests, we may
        extend this period by an additional 60 days with prior notice.
      </p>

      <h3>Right of access (Article 15)</h3>
      <p>
        You have the right to obtain confirmation of whether we process your personal data and to request
        a copy of that data, along with information about the purposes of processing, categories of data,
        recipients, retention periods, and the source of any data not collected directly from you. You can
        access and export much of your data directly through your account settings. For comprehensive data
        access requests, our compliance team will compile a complete data package within 30 days.
      </p>

      <h3>Right to rectification (Article 16)</h3>
      <p>
        You have the right to have inaccurate personal data corrected without undue delay. You can update
        most of your information directly through the Platform &mdash; including your name, email, organization
        details, and preferences. For data that cannot be self-edited (e.g., historical audit logs or
        billing records), contact our support team and we will make corrections within 10 business days.
      </p>

      <h3>Right to erasure (Article 17)</h3>
      <p>
        You have the right to request deletion of your personal data (&quot;right to be forgotten&quot;)
        when the data is no longer necessary for its original purpose, you withdraw consent, you object
        to processing and there are no overriding legitimate grounds, or the data was unlawfully processed.
        Upon receiving a valid erasure request, we delete your data from production systems within 30 days.
        Backup copies are purged within 90 days. We will retain data only where required by law (e.g.,
        billing records for tax compliance) or necessary to resolve ongoing disputes, and we will inform
        you of any such exceptions.
      </p>

      <h3>Right to data portability (Article 20)</h3>
      <p>
        You have the right to receive your personal data in a structured, commonly used, machine-readable
        format (JSON or CSV). This includes all content you created, analytics data, contact lists, brand
        configurations, and account information. You also have the right to have this data transmitted
        directly to another controller where technically feasible. Our Platform provides built-in export
        tools for self-service data portability.
      </p>

      <h3>Right to restriction of processing (Article 18)</h3>
      <p>
        You have the right to request that we restrict processing of your personal data in certain
        circumstances: while we verify the accuracy of contested data, when processing is unlawful but
        you prefer restriction over erasure, when we no longer need the data but you require it for legal
        claims, or while we evaluate an objection request. During restriction, we will store but not
        actively process the data, except with your consent or for legal claims.
      </p>

      <h3>Right to object (Article 21)</h3>
      <p>
        You have the right to object to processing based on legitimate interests (Article 6(1)(f)) at any
        time. Upon receiving an objection, we will cease processing unless we can demonstrate compelling
        legitimate grounds that override your interests, rights, and freedoms, or the processing is
        necessary for the establishment, exercise, or defense of legal claims. You have an absolute right
        to object to processing for direct marketing purposes, and we will cease such processing immediately
        upon request.
      </p>

      <h3>Right not to be subject to automated decision-making (Article 22)</h3>
      <p>
        Aura does not make automated decisions that produce legal effects or similarly significantly affect
        you based solely on automated processing, including profiling. Our AI features generate content
        suggestions and analytics insights, but all publishing, campaign, and account decisions require
        human action and approval through our workflow system.
      </p>

      <h2>Data Processing</h2>

      <h3>Categories of personal data</h3>
      <p>We process the following categories of personal data for the purposes described:</p>
      <ul>
        <li><strong>Account data</strong> (name, email, organization, role): Account management, authentication, billing, and support</li>
        <li><strong>Usage data</strong> (feature interactions, timestamps, preferences): Platform improvement, personalization, and support</li>
        <li><strong>Content data</strong> (posts, campaigns, images, SEO analyses): Service delivery, AI content generation, analytics</li>
        <li><strong>Social media data</strong> (profile information, post metrics, audience demographics): Publishing and analytics reporting</li>
        <li><strong>Technical data</strong> (hashed IP addresses, browser type, device info): Security, fraud prevention, and troubleshooting</li>
        <li><strong>Billing data</strong> (payment method metadata, invoices, subscription history): Payment processing and tax compliance</li>
      </ul>

      <h3>Data minimization</h3>
      <p>
        We collect and process only the minimum personal data necessary for each specific purpose. We do
        not collect sensitive personal data (special category data under Article 9) unless explicitly
        provided by you in content you create. We regularly review our data collection practices to
        identify and eliminate unnecessary data points.
      </p>

      <h2>Sub-Processors</h2>

      <h3>Current sub-processors</h3>
      <p>
        We engage the following sub-processors to deliver our services. Each sub-processor is bound by
        data processing agreements that include GDPR-compliant terms, appropriate technical and
        organizational measures, and restrictions on further sub-processing.
      </p>

      <table>
        <thead>
          <tr>
            <th>Sub-Processor</th>
            <th>Purpose</th>
            <th>Location</th>
            <th>Data Processed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Clerk</td>
            <td>Authentication and identity</td>
            <td>United States</td>
            <td>Name, email, session data</td>
          </tr>
          <tr>
            <td>Google Cloud / Firebase</td>
            <td>Hosting, database, storage</td>
            <td>United States</td>
            <td>All platform data</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Payment processing, billing</td>
            <td>United States</td>
            <td>Billing info, payment metadata</td>
          </tr>
          <tr>
            <td>Anthropic (Claude)</td>
            <td>AI content generation</td>
            <td>United States</td>
            <td>Content prompts, brand context</td>
          </tr>
          <tr>
            <td>Google (Vertex AI)</td>
            <td>Image generation</td>
            <td>United States</td>
            <td>Image prompts, brand assets</td>
          </tr>
        </tbody>
      </table>

      <h3>Sub-processor change notification</h3>
      <p>
        We will notify you of any changes to our sub-processor list with at least 30 days&apos; advance
        notice via email and through an announcement in the Platform. You may object to a new sub-processor
        within 14 days of notification by providing reasonable grounds. If the objection cannot be resolved,
        you may terminate the affected services without penalty. We maintain a sub-processor changelog
        accessible from your workspace compliance settings.
      </p>

      <h2>International Transfers</h2>

      <h3>Transfer mechanisms</h3>
      <p>
        Aura processes data primarily within the United States using Google Cloud Platform infrastructure.
        For transfers of personal data from the EU/EEA or UK to the United States, we rely on the
        following legally recognized transfer mechanisms:
      </p>
      <ul>
        <li><strong>EU-U.S. Data Privacy Framework (DPF):</strong> Where our sub-processors participate in the DPF, transfers are covered by their DPF certification</li>
        <li><strong>Standard Contractual Clauses (SCCs):</strong> We execute the European Commission&apos;s approved SCCs (June 2021 version) with all sub-processors as a primary transfer mechanism</li>
        <li><strong>Supplementary measures:</strong> In addition to SCCs, we implement supplementary technical measures including AES-256-GCM encryption, workspace isolation, and access controls as recommended by the EDPB</li>
      </ul>

      <h3>Transfer impact assessment</h3>
      <p>
        We have conducted a Transfer Impact Assessment (TIA) evaluating the legal framework of the United
        States in relation to EU data protection standards. Our assessment considers the safeguards provided
        by our sub-processors, the nature of the data transferred, and the supplementary technical and
        organizational measures we implement. This assessment is reviewed annually and updated when
        relevant legal or regulatory changes occur.
      </p>

      <h2>Data Retention</h2>

      <h3>Retention periods</h3>
      <p>
        We retain personal data only as long as necessary for the purposes for which it was collected, or
        as required by applicable law. Our retention periods are designed to balance operational needs
        with data minimization principles:
      </p>
      <ul>
        <li><strong>Account data:</strong> Duration of active account plus 30 days post-termination for data export</li>
        <li><strong>Content and analytics:</strong> Configurable per workspace, default 365 days, maximum 24 months after account closure</li>
        <li><strong>Billing records:</strong> 7 years (legal requirement for tax compliance)</li>
        <li><strong>Security and audit logs:</strong> 24 months (730 days)</li>
        <li><strong>Marketing consent records:</strong> 3 years after last interaction</li>
        <li><strong>Inbox messages:</strong> 90 days by default (configurable per workspace)</li>
        <li><strong>Blog analytics:</strong> 365 days</li>
      </ul>

      <h3>Retention configuration</h3>
      <p>
        Enterprise customers can configure custom retention periods through the compliance settings in
        their workspace dashboard. When data reaches the end of its retention period, it is automatically
        queued for deletion. Deletion from production systems occurs within 30 days, and backup copies
        are purged within 90 days.
      </p>

      <h2>Data Breach Notification</h2>

      <h3>Notification to supervisory authorities</h3>
      <p>
        In accordance with GDPR Article 33, in the event of a personal data breach that is likely to
        result in a risk to the rights and freedoms of natural persons, we will notify the relevant
        supervisory authority without undue delay and, where feasible, within 72 hours of becoming
        aware of the breach. If notification is not made within 72 hours, it shall be accompanied by
        reasons for the delay.
      </p>

      <h3>Notification to data subjects</h3>
      <p>
        Where a personal data breach is likely to result in a high risk to the rights and freedoms of
        natural persons, we will communicate the breach to affected data subjects without undue delay,
        as required by GDPR Article 34. Notification will include the nature of the breach, the likely
        consequences, the measures taken to address it, and recommendations for affected individuals
        to protect themselves.
      </p>

      <h3>Notification to customers (processor role)</h3>
      <p>
        When acting as a data processor, we will notify affected customers (data controllers) within 48
        hours of confirming a breach affecting their data, providing all information necessary for the
        customer to fulfill their own breach notification obligations. Our Data Processing Agreement
        details the full breach notification procedure.
      </p>

      <h2>Data Protection Officer</h2>

      <h3>Contact information</h3>
      <p>
        We have appointed a Data Protection Officer (DPO) who oversees our GDPR compliance program,
        advises on data protection impact assessments, and serves as the point of contact for data
        subjects and supervisory authorities. Our DPO can be reached at:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:dpo@aura.ai">dpo@aura.ai</a></li>
        <li><strong>Address:</strong> Aura Technologies Inc., Attn: Data Protection Officer, 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
      </ul>

      <h3>DPO responsibilities</h3>
      <p>
        Our DPO operates independently and reports directly to executive management. The DPO&apos;s
        responsibilities include monitoring compliance with GDPR and internal data protection policies,
        advising on data protection impact assessments (DPIAs), cooperating with supervisory authorities,
        and serving as the contact point for data subjects exercising their rights. The DPO is involved
        in all matters relating to the protection of personal data in a timely manner.
      </p>

      <h2>Complaints</h2>

      <h3>Lodging a complaint</h3>
      <p>
        If you believe your data protection rights have been violated, you have the right to lodge a
        complaint with a supervisory authority in the EU member state of your habitual residence, place
        of work, or place of the alleged infringement. A list of EU supervisory authorities is available
        at the European Data Protection Board website.
      </p>

      <h3>Contact us first</h3>
      <p>
        We encourage you to contact us first at <a href="mailto:dpo@aura.ai">dpo@aura.ai</a> so we can
        attempt to resolve the issue directly. We take all complaints seriously and aim to resolve them
        within 30 days. If you are not satisfied with our response, you retain the full right to lodge a
        complaint with a supervisory authority at any time. You may also seek a judicial remedy before the
        courts of the member state where you reside or where the alleged infringement occurred.
      </p>
    </LegalPageLayout>
  );
}
