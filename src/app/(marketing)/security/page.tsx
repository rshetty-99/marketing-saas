'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function SecurityPage() {
  return (
    <LegalPageLayout
      title="Security"
      subtitle="How we protect your data, accounts, and connected social media credentials."
      lastUpdated="March 15, 2026"
      effectiveDate="March 15, 2026"
      version="v1.3"
    >
      <div className="legal-highlight">
        <p>
          <strong>Summary:</strong> AES-256-GCM encryption at rest, TLS 1.3 in transit. Clerk MFA
          authentication. Workspace-scoped RBAC. SOC 2 Type II in progress.
        </p>
      </div>

      <h2>Infrastructure</h2>

      <h3>Cloud platform</h3>
      <p>
        Aura is hosted on Firebase App Hosting backed by Google Cloud Platform (GCP). Our infrastructure
        benefits from GCP&apos;s world-class physical security, including biometric access controls,
        24/7 surveillance, and multi-layered perimeter defenses across data centers that hold SOC 1/2/3,
        ISO 27001, ISO 27017, ISO 27018, and PCI DSS certifications. All data is stored in Firestore
        with automatic replication across multiple availability zones for high durability and fault tolerance.
      </p>

      <h3>Serverless architecture</h3>
      <p>
        We use Firebase Cloud Functions for serverless compute, Cloud Tasks for background job processing,
        and Cloud Scheduler for automated maintenance operations. This architecture eliminates the need
        for persistent servers, reducing our attack surface. All services communicate over private internal
        networks within GCP&apos;s VPC, and no database ports are exposed to the public internet.
      </p>

      <h3>Environment isolation</h3>
      <p>
        Production, staging, and development environments are fully isolated with separate GCP projects,
        Firestore instances, and service accounts. No development or testing activity ever touches
        production data. Deployment pipelines enforce environment separation through automated checks
        and approval gates.
      </p>

      <h2>Data Encryption</h2>

      <h3>Encryption at rest</h3>
      <p>
        All data stored in Firestore is encrypted at rest using Google-managed encryption keys (AES-256).
        Sensitive data &mdash; including OAuth tokens, API credentials, and encryption keys &mdash; receives an
        additional layer of application-level encryption using AES-256-GCM with workspace-specific keys
        before being written to the database. This ensures that even in the unlikely event of a database
        breach, sensitive credentials remain cryptographically protected.
      </p>

      <h3>Encryption in transit</h3>
      <p>
        All data in transit is encrypted using TLS 1.3 with strong cipher suites. We enforce HTTPS across
        all endpoints and reject non-encrypted connections at the load balancer level. API communications
        with third-party services (social media platforms, Stripe, Anthropic, Vertex AI) also use TLS.
        We regularly audit our TLS configuration and maintain an A+ rating on SSL Labs assessments.
      </p>

      <table>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Encryption Method</th>
            <th>Key Management</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Firestore documents</td>
            <td>AES-256 (Google-managed)</td>
            <td>Google Cloud KMS, automatic rotation</td>
          </tr>
          <tr>
            <td>OAuth access/refresh tokens</td>
            <td>AES-256-GCM (application-level)</td>
            <td>Workspace-specific keys, Firebase Secret Manager</td>
          </tr>
          <tr>
            <td>API credentials</td>
            <td>AES-256-GCM (application-level)</td>
            <td>Firebase Secret Manager</td>
          </tr>
          <tr>
            <td>File uploads (Firebase Storage)</td>
            <td>AES-256 (Google-managed)</td>
            <td>Google Cloud KMS, automatic rotation</td>
          </tr>
          <tr>
            <td>Data in transit</td>
            <td>TLS 1.3</td>
            <td>Managed certificates, auto-renewal</td>
          </tr>
          <tr>
            <td>Backup snapshots</td>
            <td>AES-256 (Google-managed)</td>
            <td>Google Cloud KMS, separate backup keys</td>
          </tr>
        </tbody>
      </table>

      <h2>Authentication and MFA</h2>

      <h3>Clerk authentication</h3>
      <p>
        We use Clerk as our authentication provider, delivering enterprise-grade identity management
        with secure email/password login and social sign-in (Google, GitHub). Clerk handles password
        hashing using bcrypt with appropriate work factors, session management with short-lived JWTs
        and automatic rotation, and account recovery through secure email verification flows with
        time-limited tokens.
      </p>

      <h3>Multi-factor authentication</h3>
      <p>
        Aura supports multi-factor authentication (MFA) via TOTP authenticator apps and SMS verification.
        We strongly recommend enabling MFA for all accounts, especially those with administrative
        privileges. Enterprise customers can enforce MFA at the organization level, requiring all
        workspace members to configure a second factor before accessing the Platform.
      </p>

      <h3>Session security</h3>
      <p>
        Authentication sessions use short-lived JSON Web Tokens with automatic refresh. Sessions are
        bound to the originating device and IP range. Inactive sessions expire automatically, and users
        can view and revoke active sessions from their account settings. Password policies enforce
        minimum complexity requirements, and failed login attempts are rate-limited and monitored for
        brute-force patterns.
      </p>

      <h2>Access Control (RBAC)</h2>

      <h3>Role-based permissions</h3>
      <p>
        Aura implements a comprehensive role-based access control (RBAC) system with 14 distinct roles
        across three scopes: workspace roles (Owner, Admin, Manager, Editor, Viewer, Freelancer),
        platform roles (Super Admin, Platform Admin, Support Agent, Billing Admin, Content Moderator,
        Compliance Officer, Platform Viewer, Developer), and client portal roles. Every API route
        validates user permissions before processing requests, and UI elements are conditionally
        rendered based on the authenticated user&apos;s role.
      </p>

      <h3>Workspace isolation</h3>
      <p>
        Workspace isolation is enforced at the database level through Firestore security rules. Every
        query must include the authenticated user&apos;s workspace ID, and cross-workspace data access is
        architecturally impossible. For agency accounts managing multiple clients, dual-scope filters
        (workspace ID + client ID) are enforced on every query to prevent cross-client data leakage.
        The RBAC system uses a 5-minute cache with Firestore-backed permission stores to balance
        security with performance.
      </p>

      <h3>Principle of least privilege</h3>
      <p>
        All service accounts, Cloud Functions, and internal systems operate under the principle of least
        privilege. Each component is granted only the minimum permissions required to perform its function.
        Service account keys are rotated regularly, and access grants are reviewed quarterly.
      </p>

      <h2>OAuth Token Security</h2>

      <h3>Encrypted token storage</h3>
      <p>
        When you connect social media accounts (LinkedIn, Twitter/X, Instagram, Facebook, TikTok,
        YouTube, Pinterest, Google Business Profile), the OAuth access and refresh tokens are encrypted
        using AES-256-GCM with a workspace-specific encryption key before being stored in Firestore.
        Tokens are decrypted only at the moment of use for publishing or analytics retrieval, and are
        immediately discarded from memory after the operation completes.
      </p>

      <h3>Token lifecycle management</h3>
      <p>
        Token refresh operations are handled by automated Cloud Functions that decrypt, refresh,
        re-encrypt, and store updated tokens on an hourly schedule. API responses listing connected
        accounts never include token values &mdash; they are stripped at the service layer before serialization.
        Disconnecting a social media account immediately and permanently deletes all associated tokens
        from Firestore. Revocation requests are also sent to the social media platform&apos;s OAuth
        endpoint to invalidate the token on their side.
      </p>

      <h2>Network Security</h2>

      <h3>DDoS protection and edge security</h3>
      <p>
        The Platform is protected by Google Cloud&apos;s built-in DDoS mitigation, which absorbs
        volumetric attacks at the network edge before they reach our application layer. We use
        Cloud Armor for web application firewall (WAF) rules, rate limiting, and geographic access
        controls. API endpoints are protected with per-route rate limiting that adapts to usage patterns.
      </p>

      <h3>Network segmentation</h3>
      <p>
        Our infrastructure uses GCP&apos;s Virtual Private Cloud (VPC) with private service connections.
        Firestore, Cloud Functions, and Cloud Tasks communicate over Google&apos;s internal network fabric.
        No database ports or internal services are exposed to the public internet. External API
        integrations (social media platforms, payment processors, AI providers) communicate exclusively
        over TLS-encrypted connections.
      </p>

      <h2>Vulnerability Management</h2>

      <h3>Dependency scanning</h3>
      <p>
        We use automated dependency scanning tools to continuously monitor our codebase for known
        vulnerabilities. Critical and high-severity vulnerabilities in dependencies are patched within
        48 hours of disclosure. We maintain a strict policy of keeping all production dependencies
        within one major version of their latest release.
      </p>

      <h3>Penetration testing</h3>
      <p>
        We conduct annual third-party penetration testing of our application and infrastructure.
        Findings are prioritized by severity and remediated according to our SLA: critical within
        24 hours, high within 7 days, medium within 30 days. Results and remediation reports are
        available to enterprise customers upon request under NDA.
      </p>

      <h3>Secure development practices</h3>
      <p>
        All code changes undergo peer review before merging. Our CI/CD pipeline includes automated
        security linting, type checking (TypeScript strict mode), and input validation verification.
        All API routes use Zod schema validation on incoming requests. We follow OWASP Top 10
        guidelines and conduct regular security-focused code reviews.
      </p>

      <h2>Incident Response</h2>

      <h3>Incident response plan</h3>
      <p>
        Aura maintains a documented incident response plan with clearly defined roles, escalation
        procedures, and communication templates. Our incident response team is available 24/7 and
        can be reached at <a href="mailto:security@aura.ai">security@aura.ai</a>. We classify
        incidents by severity (P0 through P3) and maintain target response times of 15 minutes for
        P0 (critical), 1 hour for P1 (high), 4 hours for P2 (medium), and 24 hours for P3 (low).
      </p>

      <h3>Breach notification</h3>
      <p>
        In the event of a confirmed data breach affecting customer data, we will notify affected
        customers within 48 hours of confirmation, in compliance with GDPR Article 33 and other
        applicable breach notification laws. Notifications will include the nature of the breach,
        categories of affected data, remediation steps taken, and recommendations for affected users.
        We maintain a breach register documenting all security incidents and their resolution.
      </p>

      <h2>SOC 2 Compliance</h2>

      <h3>Certification status</h3>
      <p>
        Aura is actively working toward SOC 2 Type II certification covering the Security, Availability,
        and Confidentiality trust service criteria. Our underlying infrastructure provider (GCP/Firebase)
        already holds SOC 2 Type II certification. Our expected completion date for Aura&apos;s own
        SOC 2 Type II audit is Q3 2026.
      </p>

      <h3>Internal controls</h3>
      <p>
        We maintain internal security policies and controls that align with SOC 2 requirements, covering
        access management, change management, incident response, risk assessment, vendor management,
        and business continuity. These policies are reviewed and updated quarterly. Enterprise customers
        can request our current compliance documentation, including our SOC 2 readiness assessment,
        under NDA.
      </p>

      <h2>Responsible Disclosure</h2>

      <h3>Vulnerability reporting</h3>
      <p>
        We welcome and appreciate responsible security research. If you discover a security vulnerability
        in the Aura platform, please report it to <a href="mailto:security@aura.ai">security@aura.ai</a>.
        We ask that you provide sufficient detail to reproduce the vulnerability, allow reasonable time
        (minimum 90 days) for us to investigate and remediate before any public disclosure, and refrain
        from accessing or modifying other users&apos; data or performing denial-of-service testing.
      </p>

      <h3>Our commitment to researchers</h3>
      <p>
        We acknowledge all vulnerability reports within 24 hours and provide regular status updates
        throughout the remediation process. We will not pursue legal action against researchers who
        act in good faith and comply with our disclosure guidelines. We recognize researchers in our
        security hall of fame (with permission) and are working toward a formal bug bounty program.
      </p>

      <h2>Contact</h2>
      <p>For security-related inquiries, concerns, or vulnerability reports, contact us at:</p>
      <ul>
        <li><strong>Security team:</strong> <a href="mailto:security@aura.ai">security@aura.ai</a></li>
        <li><strong>Privacy team:</strong> <a href="mailto:privacy@aura.ai">privacy@aura.ai</a></li>
        <li><strong>Legal team:</strong> <a href="mailto:legal@aura.ai">legal@aura.ai</a></li>
        <li><strong>Address:</strong> Aura Technologies Inc., 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
      </ul>
    </LegalPageLayout>
  );
}
