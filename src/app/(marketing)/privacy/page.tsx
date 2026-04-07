'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How Aura.ai collects, uses, and protects your information."
      lastUpdated="March 15, 2026"
      effectiveDate="March 15, 2026"
      version="v2.1"
    >
      <div className="legal-highlight">
        <p>
          <strong>Summary:</strong> We collect only what we need to run the platform. We never sell your data.
          Your content belongs to you. OAuth tokens are encrypted. You can delete your data at any time.
        </p>
      </div>

      <h2>Information We Collect</h2>

      <h3>Information you provide</h3>
      <p>
        When you create an account, we collect your name, email address, organization name, and role. During
        onboarding, you may provide additional business information including your industry, target audience,
        brand voice preferences, and marketing goals.
      </p>

      <h3>Social media account data</h3>
      <p>
        When you connect social media accounts (LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube,
        Pinterest, or Google Business Profile), we receive OAuth tokens and profile information necessary to
        publish content and retrieve analytics on your behalf. <strong>We encrypt all OAuth tokens using
        AES-256-GCM before storing them.</strong>
      </p>

      <h3>Content and usage data</h3>
      <p>
        We collect content you create or generate using our AI tools, including drafts, published posts, email
        campaigns, images, and SEO analyses. We also collect usage data such as feature interactions, content
        performance metrics, and platform preferences.
      </p>

      <h3>Automatically collected information</h3>
      <p>
        We automatically collect device information, IP addresses (hashed for privacy), browser type, operating
        system, referral URLs, and interaction data. We do <strong>not</strong> use third-party tracking cookies.
        Blog analytics use privacy-safe hashed visitor identifiers with daily rotating salts.
      </p>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve the Platform</li>
        <li>Generate AI-powered content recommendations and marketing suggestions</li>
        <li>Publish content to connected social media accounts on your behalf</li>
        <li>Compile analytics and performance reports across your connected channels</li>
        <li>Process subscription payments and manage billing through Stripe</li>
        <li>Send transactional emails (account verification, approval notifications, billing receipts)</li>
        <li>Provide customer support and respond to inquiries</li>
        <li>Detect and prevent fraud, abuse, and security incidents</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>AI Content Generation</h2>
      <div className="legal-highlight">
        <p>
          <strong>Important:</strong> Content you generate using Aura&apos;s AI tools belongs to you. We do not
          use your generated content to train AI models. Your prompts and outputs are processed by our AI
          provider (Anthropic Claude) under a data processing agreement that prohibits training on customer data.
        </p>
      </div>
      <p>
        When you use AI features (content generation, SEO analysis, image creation), your input prompts and
        brand context are sent to our AI infrastructure. The AI provider processes these in real-time and does
        not retain your data after generating the response.
      </p>

      <h2>Data Sharing</h2>
      <p>We do not sell your personal information. We share data only in the following circumstances:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> We use third-party services including Clerk (authentication),
          Firebase/Google Cloud Platform (hosting and storage), Stripe (payments), Anthropic (AI), and
          Vertex AI (image generation) to operate the Platform.
        </li>
        <li>
          <strong>Social media platforms:</strong> When you use our publishing features, content is transmitted
          to the social media platforms you have connected. Each platform&apos;s own privacy policy applies to that data.
        </li>
        <li>
          <strong>Agency-client relationships:</strong> If you are a client of an agency using Aura, your agency
          may access content and analytics within their workspace as configured by their account settings.
          Client data is isolated per workspace — agencies cannot see other agencies&apos; data.
        </li>
        <li>
          <strong>Legal requirements:</strong> We may disclose information to comply with applicable law,
          regulation, legal process, or enforceable governmental request.
        </li>
      </ul>

      <h2>Social Media Data</h2>
      <p>
        When you connect social media accounts to Aura, we access only the data necessary to provide our
        services. This includes profile information, post performance metrics, audience demographics, and
        publishing capabilities.
      </p>
      <p>
        <strong>We do not access:</strong> private messages, personal social media content unrelated to your
        marketing activities, or data from accounts you have not explicitly connected.
      </p>
      <p>
        You can disconnect any social media account at any time from your workspace settings. Upon disconnection,
        we stop collecting new data and revoke our access tokens. Previously collected analytics data is retained
        according to our data retention policy.
      </p>

      <h2>Cookies &amp; Tracking</h2>
      <p>
        The Aura platform uses essential cookies for authentication (Clerk session cookies) and preference
        storage (theme selection). We do <strong>not</strong> use third-party advertising cookies or cross-site
        tracking pixels.
      </p>
      <p>
        Our blog analytics system uses privacy-safe hashed visitor identifiers (SHA-256 with daily rotating
        salts) instead of cookies. This allows us to count unique visitors without storing personally
        identifiable information.
      </p>

      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>__clerk_session</td>
            <td>Authentication session</td>
            <td>Session</td>
            <td>Essential</td>
          </tr>
          <tr>
            <td>theme</td>
            <td>Light/dark mode preference</td>
            <td>1 year</td>
            <td>Functional</td>
          </tr>
        </tbody>
      </table>

      <h2>Data Retention</h2>
      <p>We retain your data for as long as your account is active. Specific retention periods:</p>
      <ul>
        <li><strong>Account data:</strong> Until account deletion</li>
        <li><strong>Content drafts:</strong> Indefinitely (configurable per workspace)</li>
        <li><strong>Analytics data:</strong> 365 days by default (configurable)</li>
        <li><strong>Audit logs:</strong> 730 days (2 years)</li>
        <li><strong>Inbox messages:</strong> 90 days by default (configurable)</li>
        <li><strong>Blog analytics:</strong> 365 days</li>
      </ul>
      <p>
        Enterprise customers can configure custom retention periods through the compliance settings in
        their workspace dashboard.
      </p>

      <h2>Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
        <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
        <li><strong>Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
        <li><strong>Restriction:</strong> Request that we limit processing of your data</li>
        <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        <li><strong>Withdrawal of consent:</strong> Withdraw previously given consent at any time</li>
      </ul>
      <p>
        To exercise any of these rights, submit a data subject request through the Compliance page in your
        workspace dashboard, or email <a href="mailto:privacy@aura.ai">privacy@aura.ai</a>.
        We respond to all verified requests within 30 days.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Aura is a business-to-business platform designed for marketing professionals and agencies. We do not
        knowingly collect information from individuals under the age of 16. If you believe we have collected
        data from a minor, please contact us immediately at{' '}
        <a href="mailto:privacy@aura.ai">privacy@aura.ai</a>.
      </p>

      <h2>International Data Transfers</h2>
      <p>
        Aura is hosted on Google Cloud Platform with primary infrastructure in the United States. If you
        access the Platform from outside the US, your data will be transferred to and processed in the US.
        We rely on Standard Contractual Clauses (SCCs) and data processing agreements with our sub-processors
        to ensure adequate data protection for international transfers.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by
        posting the new policy on this page, updating the &quot;Last updated&quot; date, and sending a notification
        through the Platform for significant changes. Your continued use of the Platform after changes
        constitutes acceptance of the updated policy.
      </p>

      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy or our data practices, contact us at:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@aura.ai">privacy@aura.ai</a></li>
        <li><strong>Legal team:</strong> <a href="mailto:legal@aura.ai">legal@aura.ai</a></li>
        <li><strong>Address:</strong> Aura.ai, 123 Innovation Way, Suite 400, New York, NY 10001</li>
        <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@aura.ai">dpo@aura.ai</a></li>
      </ul>
    </LegalPageLayout>
  );
}
