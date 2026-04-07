'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function DPAPage() {
  return (
    <LegalPageLayout title="Data Processing Agreement" lastUpdated="March 15, 2026">
      <p>
        This Data Processing Agreement (&quot;DPA&quot;) forms part of the Terms of Service between Aura Technologies Inc. (&quot;Processor&quot;, &quot;Aura&quot;) and the entity agreeing to the Terms of Service (&quot;Controller&quot;, &quot;Customer&quot;) for the processing of personal data in connection with the Aura platform.
      </p>

      <h2>Definitions</h2>
      <ul>
        <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable natural person as defined by applicable data protection laws.</li>
        <li><strong>&quot;Processing&quot;</strong> means any operation performed on Personal Data, including collection, recording, organization, storage, retrieval, use, disclosure, or erasure.</li>
        <li><strong>&quot;Data Subject&quot;</strong> means the identified or identifiable natural person to whom Personal Data relates.</li>
        <li><strong>&quot;Sub-Processor&quot;</strong> means a third party engaged by the Processor to process Personal Data on behalf of the Controller.</li>
        <li><strong>&quot;Data Breach&quot;</strong> means a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data.</li>
        <li><strong>&quot;Applicable Data Protection Law&quot;</strong> means the GDPR, UK GDPR, CCPA, and any other applicable data protection legislation.</li>
      </ul>

      <h2>Scope</h2>
      <p>
        This DPA applies to all Processing of Personal Data by Aura on behalf of the Customer in the course of providing the platform services described in the Terms of Service. This includes processing of:
      </p>
      <ul>
        <li>Customer&apos;s end-user and client contact information</li>
        <li>Email subscriber lists and lead form submissions</li>
        <li>Social media audience data and engagement metrics</li>
        <li>Content that may contain personal data of third parties</li>
        <li>Any other personal data uploaded to or processed through the platform</li>
      </ul>

      <h2>Data Processing Details</h2>
      <h3>Subject matter and duration</h3>
      <p>
        The subject matter of the processing is the provision of the Aura marketing platform. Processing will continue for the duration of the Customer&apos;s subscription plus any retention periods specified in this DPA.
      </p>
      <h3>Nature and purpose</h3>
      <p>
        Processing includes storage, retrieval, organization, analysis, and transmission of Personal Data as necessary to provide AI content generation, social media publishing, email campaigns, analytics, lead management, and related platform features.
      </p>
      <h3>Types of personal data</h3>
      <p>
        Contact information (names, email addresses, phone numbers), social media identifiers, IP addresses, job titles, company names, and any other personal data included in content created or processed through the platform.
      </p>
      <h3>Categories of data subjects</h3>
      <p>
        Customer employees and team members, Customer&apos;s clients and their employees, email subscribers, lead form respondents, social media followers and audiences.
      </p>

      <h2>Obligations of Processor</h2>
      <p>Aura shall:</p>
      <ul>
        <li>Process Personal Data only on documented instructions from the Controller, unless required by applicable law</li>
        <li>Ensure that persons authorized to process Personal Data are bound by confidentiality obligations</li>
        <li>Implement appropriate technical and organizational security measures</li>
        <li>Assist the Controller in responding to Data Subject requests</li>
        <li>Assist the Controller in ensuring compliance with security, breach notification, and data protection impact assessment obligations</li>
        <li>Delete or return all Personal Data upon termination of services, unless retention is required by law</li>
        <li>Make available to the Controller all information necessary to demonstrate compliance with this DPA</li>
      </ul>

      <h2>Sub-Processing</h2>
      <p>
        The Controller grants general authorization for Aura to engage Sub-Processors for the processing of Personal Data. The current list of Sub-Processors is maintained on our GDPR compliance page.
      </p>
      <ul>
        <li>Aura will notify the Controller at least 30 days before adding or replacing a Sub-Processor</li>
        <li>The Controller may object to a new Sub-Processor within 14 days of notification by providing reasonable grounds</li>
        <li>If the objection cannot be resolved, the Controller may terminate the affected services without penalty</li>
        <li>Aura will impose data protection obligations on Sub-Processors equivalent to those in this DPA</li>
        <li>Aura remains fully liable for the performance of its Sub-Processors</li>
      </ul>

      <h2>Data Subject Rights</h2>
      <p>
        Aura will assist the Controller in fulfilling its obligations to respond to Data Subject requests under applicable data protection law. This includes requests for access, rectification, erasure, restriction, portability, and objection.
      </p>
      <ul>
        <li>Aura will promptly notify the Controller of any Data Subject request received directly</li>
        <li>Aura will not respond to Data Subject requests directly unless authorized by the Controller</li>
        <li>The platform provides self-service tools for common Data Subject request types (data export, account deletion)</li>
        <li>For complex requests, Aura will provide reasonable technical assistance within 10 business days</li>
      </ul>

      <h2>Security Measures</h2>
      <p>
        Aura implements the following technical and organizational measures to protect Personal Data:
      </p>
      <ul>
        <li><strong>Encryption:</strong> AES-256-GCM for data at rest (including OAuth tokens), TLS 1.3 for data in transit</li>
        <li><strong>Access control:</strong> Role-based access control with 14 roles, multi-factor authentication, workspace isolation enforced at database level</li>
        <li><strong>Infrastructure:</strong> Google Cloud Platform with SOC 2 Type II certification, automatic failover, and redundancy</li>
        <li><strong>Monitoring:</strong> Automated security monitoring, audit logging, and anomaly detection</li>
        <li><strong>Personnel:</strong> Background checks, confidentiality agreements, and regular security training for all employees with data access</li>
        <li><strong>Incident response:</strong> Documented incident response plan with defined escalation procedures</li>
      </ul>

      <h2>Data Breach Notification</h2>
      <p>
        In the event of a Data Breach affecting Personal Data processed on behalf of the Controller, Aura will:
      </p>
      <ul>
        <li>Notify the Controller without undue delay and in any event within 48 hours of becoming aware of the breach</li>
        <li>Provide all information reasonably required for the Controller to fulfill its breach notification obligations under applicable law</li>
        <li>Include in the notification: nature of the breach, categories and approximate number of affected Data Subjects, likely consequences, and measures taken or proposed to address the breach</li>
        <li>Cooperate with the Controller and take reasonable commercial steps to mitigate the effects of the breach</li>
        <li>Document all Data Breaches and their remediation in an internal breach register</li>
      </ul>

      <h2>Data Deletion</h2>
      <p>
        Upon termination of the subscription or upon Controller request:
      </p>
      <ul>
        <li>Aura will provide a 30-day data export window following termination</li>
        <li>After the export window, all Personal Data will be permanently deleted from production systems within 30 days</li>
        <li>Backup copies will be deleted within 90 days of the deletion request</li>
        <li>Aura will provide written confirmation of deletion upon Controller request</li>
        <li>Data required to be retained by applicable law will be isolated and protected until the retention period expires</li>
      </ul>

      <h2>Audits</h2>
      <p>
        Aura will make available to the Controller information necessary to demonstrate compliance with this DPA. The Controller may conduct audits subject to the following conditions:
      </p>
      <ul>
        <li>Audits may be conducted no more than once per year, with at least 30 days advance written notice</li>
        <li>Audits will be conducted during normal business hours and will not unreasonably disrupt Aura&apos;s operations</li>
        <li>The Controller may engage a qualified independent third-party auditor, subject to confidentiality obligations</li>
        <li>Aura may satisfy audit requests by providing existing certifications, audit reports, or compliance documentation</li>
      </ul>

      <h2>Liability</h2>
      <p>
        Each party&apos;s liability under this DPA is subject to the limitations of liability set forth in the Terms of Service, except that neither party&apos;s liability for breaches of data protection obligations shall be limited in a manner that would prevent a Data Subject from exercising their rights under applicable data protection law.
      </p>

      <h2>Term and Termination</h2>
      <p>
        This DPA takes effect upon the Customer&apos;s acceptance of the Terms of Service and remains in effect for the duration of the subscription. Provisions relating to data deletion, audit rights, and confidentiality survive termination.
      </p>
      <p>
        For questions about this DPA, contact us at <a href="mailto:legal@aura.ai">legal@aura.ai</a> or <a href="mailto:dpo@aura.ai">dpo@aura.ai</a>.
      </p>
    </LegalPageLayout>
  );
}
