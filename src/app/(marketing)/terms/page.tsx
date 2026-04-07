'use client';

import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The agreement between you and Aura.ai when you use our platform."
      lastUpdated="March 15, 2026"
      effectiveDate="March 15, 2026"
      version="v2.0"
    >
      <div className="legal-highlight">
        <p>
          <strong>Summary:</strong> By using Aura, you agree to these terms. You own your content.
          We provide the platform as-is. You are responsible for your published content.
        </p>
      </div>

      <h2>Acceptance of Terms</h2>

      <h3>Agreement to be bound</h3>
      <p>
        These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and
        Aura Technologies Inc. (&quot;Aura&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) governing your access to and use of the
        Aura.ai platform, including all associated services, APIs, and applications (collectively, the
        &quot;Platform&quot;). By creating an account, accessing, or using the Platform in any way, you
        acknowledge that you have read, understood, and agree to be bound by these Terms.
      </p>

      <h3>Authority and eligibility</h3>
      <p>
        You represent that you are at least 18 years old and have the legal capacity to enter into a
        binding agreement. If you are accessing the Platform on behalf of a company, agency, or other
        legal entity, you represent and warrant that you have the authority to bind that entity to these
        Terms. In such cases, &quot;you&quot; and &quot;your&quot; refer to that entity.
      </p>

      <h3>Modifications to terms</h3>
      <p>
        We reserve the right to modify these Terms at any time. We will provide at least 30 days&apos;
        advance notice of material changes via email to the address associated with your account and
        through a prominent notification within the Platform. Your continued use of the Platform after
        the effective date of any modification constitutes acceptance of the revised Terms. If you do not
        agree with the changes, you must discontinue use and terminate your account before the changes
        take effect.
      </p>

      <h2>Account Terms</h2>

      <h3>Registration and account security</h3>
      <p>
        To use the Platform, you must create an account by providing accurate, complete, and current
        registration information, including your name, email address, and organization details. You are
        responsible for maintaining the confidentiality of your account credentials and for all activities
        that occur under your account. Each individual user must maintain a unique account; account sharing
        or credential sharing between individuals is strictly prohibited.
      </p>

      <h3>Account responsibilities</h3>
      <p>
        You must immediately notify us at <a href="mailto:security@aura.ai">security@aura.ai</a> if you
        suspect any unauthorized access to your account or any other breach of security. Aura will not be
        liable for any loss or damage arising from your failure to maintain account security. You are
        solely responsible for all actions taken through your account, including content published to
        connected social media platforms, emails sent through our campaign tools, and any data uploaded
        to the Platform.
      </p>

      <h3>Account suspension</h3>
      <p>
        We reserve the right to suspend or restrict access to any account that we reasonably believe
        violates these Terms, poses a security risk to the Platform or other users, or engages in
        activity that could expose Aura to legal liability. We will make reasonable efforts to notify
        you before or promptly after any suspension, unless doing so would compromise security or
        violate legal obligations.
      </p>

      <h2>Subscription and Billing</h2>

      <h3>Subscription tiers</h3>
      <p>
        The Platform is available under multiple subscription tiers, each with specific features, usage
        limits, and pricing. A summary of current tiers is provided below. Full details, including
        add-on pricing and enterprise custom plans, are available on our pricing page.
      </p>

      <table>
        <thead>
          <tr>
            <th>Tier</th>
            <th>Monthly Price</th>
            <th>Seats Included</th>
            <th>AI Generations</th>
            <th>Social Accounts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Starter</td>
            <td>$49/mo</td>
            <td>2</td>
            <td>500/mo</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Growth</td>
            <td>$149/mo</td>
            <td>5</td>
            <td>2,500/mo</td>
            <td>15</td>
          </tr>
          <tr>
            <td>Agency</td>
            <td>$399/mo</td>
            <td>15</td>
            <td>10,000/mo</td>
            <td>50</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>Custom</td>
            <td>Unlimited</td>
            <td>Custom</td>
            <td>Unlimited</td>
          </tr>
        </tbody>
      </table>

      <h3>Free trial</h3>
      <p>
        New accounts receive a 15-day free trial with full access to all Platform features, subject to
        usage caps. No credit card is required to start a trial. At the end of the trial period, your
        account will be soft-locked: existing data is preserved but read-only access applies until you
        select a paid subscription. Trial accounts that remain inactive for 90 days after trial expiry
        may be scheduled for data deletion with 30 days&apos; advance notice.
      </p>

      <h3>Billing and payment</h3>
      <p>
        Subscriptions are billed monthly or annually in advance through our payment processor, Stripe.
        Per-seat charges apply based on the number of active workspace members. You authorize us to
        charge the payment method on file for all applicable fees. Upgrades take effect immediately with
        prorated charges; downgrades take effect at the end of the current billing period. We reserve
        the right to adjust pricing with at least 30 days&apos; advance written notice. Refunds are not
        provided for partial billing periods; however, you may cancel at any time and retain access
        through the end of your paid period.
      </p>

      <h2>AI Content Ownership</h2>

      <h3>Your ownership of generated content</h3>
      <p>
        Content generated through the Platform&apos;s AI features &mdash; including text, image, and SEO
        suggestions &mdash; is owned by you, subject to the terms below. You retain all intellectual property
        rights to content you create, generate, or upload using the Platform. Aura claims no ownership
        interest in your content.
      </p>

      <h3>License grant to Aura</h3>
      <p>
        You grant Aura a limited, non-exclusive, royalty-free, worldwide license to process, store, cache,
        and display your content solely as necessary to provide, maintain, and improve the Platform&apos;s
        services. This license terminates when you delete the content or close your account, except as
        required for backup retention periods described in our Privacy Policy.
      </p>

      <h3>AI content disclaimers</h3>
      <p>
        AI-generated content is provided &quot;as is&quot; without warranties of any kind. You are solely
        responsible for reviewing all AI-generated output before publication and for ensuring that it complies
        with applicable laws, regulations, advertising standards, and third-party rights. Aura does not
        guarantee that AI-generated content is original, factually accurate, free from bias, or suitable
        for any particular purpose. We do not use your generated content or prompts to train AI models.
        Your data is processed by our AI provider (Anthropic Claude) under a data processing agreement
        that prohibits training on customer data.
      </p>

      <h2>Social Media Publishing</h2>

      <h3>Platform terms compliance</h3>
      <p>
        When you use Aura to publish content to connected social media accounts, you acknowledge that all
        published content is subject to the terms of service, community guidelines, and content policies
        of each respective social media platform. Aura is not responsible for any actions taken by social
        media platforms in response to content published through our Platform, including but not limited
        to content removal, account suspension, or reach reduction.
      </p>

      <h3>Advertising and disclosure obligations</h3>
      <p>
        You are solely responsible for ensuring that published content complies with all applicable
        advertising disclosure requirements, including FTC endorsement guidelines, ASA regulations, and
        any jurisdiction-specific disclosure rules. This includes proper labeling of sponsored content,
        affiliate relationships, and AI-generated material where required by law. Aura provides disclosure
        tools but does not monitor compliance on your behalf.
      </p>

      <h3>Scheduling and automation</h3>
      <p>
        Scheduling and auto-publishing features execute at the specified time based on your configuration.
        Aura makes commercially reasonable efforts to ensure timely delivery but does not guarantee
        exact-time publishing due to factors outside our control, including social media API rate limits,
        platform outages, and network conditions. You are responsible for reviewing and approving all
        scheduled content before publication through the Platform&apos;s approval workflow.
      </p>

      <h2>Acceptable Use</h2>

      <h3>Prohibited activities</h3>
      <p>You agree not to use the Platform to:</p>
      <ul>
        <li>Violate any applicable law, regulation, or third-party rights</li>
        <li>Generate, publish, or distribute content that is unlawful, defamatory, harassing, threatening, or fraudulent</li>
        <li>Send unsolicited commercial messages (spam) through email campaigns or social publishing features</li>
        <li>Attempt to gain unauthorized access to other accounts, workspaces, or Platform infrastructure</li>
        <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the Platform</li>
        <li>Use automated means (bots, scrapers, crawlers) to access the Platform except through our official API with valid credentials</li>
        <li>Interfere with or disrupt the Platform&apos;s operation or impose unreasonable load on our infrastructure</li>
        <li>Misrepresent AI-generated content as human-created in jurisdictions that require disclosure</li>
        <li>Use the Platform to store, transmit, or process data subject to heightened regulatory requirements (e.g., HIPAA-protected health data, payment card numbers) without a separate written agreement</li>
        <li>Resell, sublicense, or provide the Platform as a managed service to third parties without an Agency or Enterprise subscription</li>
      </ul>

      <h3>Enforcement</h3>
      <p>
        We may investigate and take action against violations of this section, including content removal,
        account suspension, and permanent termination. Repeated or severe violations may result in
        immediate termination without prior notice. We reserve the right to report illegal activity to
        appropriate law enforcement authorities.
      </p>

      <h2>Data Ownership</h2>

      <h3>Customer data</h3>
      <p>
        You retain ownership of all data you upload to or create within the Platform (&quot;Customer Data&quot;).
        This includes content drafts, published posts, brand assets, client information, email subscriber
        lists, lead data, analytics configurations, and any other data you input. Aura does not claim
        ownership of Customer Data and will not access it except as necessary to provide the Platform&apos;s
        services, respond to support requests, or comply with legal obligations.
      </p>

      <h3>Data export and portability</h3>
      <p>
        You may export your Customer Data at any time through the Platform&apos;s export tools or by
        contacting support at <a href="mailto:support@aura.ai">support@aura.ai</a>. We provide data exports
        in structured, machine-readable formats (JSON, CSV). Upon account termination, we retain your
        Customer Data for 30 days to allow for export, after which it is permanently deleted from production
        systems within an additional 30 days. Backup copies are purged within 90 days of deletion.
      </p>

      <h3>Agency data responsibilities</h3>
      <p>
        For agency accounts managing client workspaces: client data within your workspace is your
        responsibility. You must maintain appropriate agreements with your clients regarding data handling,
        processing, and privacy. Aura enforces workspace-level isolation but does not audit
        agency-client relationships. Each client&apos;s data is isolated by both workspace ID and client
        ID at the database level.
      </p>

      <h2>Intellectual Property</h2>

      <h3>Aura&apos;s intellectual property</h3>
      <p>
        The Platform, including all software, algorithms, user interfaces, designs, documentation, trademarks,
        service marks, and trade dress, is the exclusive property of Aura Technologies Inc. and its licensors.
        Nothing in these Terms grants you any right, title, or interest in the Platform beyond the limited
        right to use it in accordance with these Terms. You may not copy, modify, distribute, sell, or
        lease any part of the Platform or its underlying technology.
      </p>

      <h3>Feedback</h3>
      <p>
        If you provide suggestions, feature requests, or other feedback about the Platform (&quot;Feedback&quot;),
        you grant Aura an unrestricted, perpetual, irrevocable, royalty-free license to use, modify, and
        incorporate that Feedback into the Platform without obligation to you. This does not apply to
        Customer Data or content you create through the Platform.
      </p>

      <h2>Limitation of Liability</h2>

      <h3>Exclusion of certain damages</h3>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL AURA, ITS AFFILIATES,
        OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL,
        OR BUSINESS OPPORTUNITIES ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE
        PLATFORM, REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE)
        AND EVEN IF AURA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>

      <h3>Aggregate liability cap</h3>
      <p>
        OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE
        PLATFORM SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO AURA IN THE TWELVE (12)
        MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED US DOLLARS
        ($100).
      </p>

      <h3>Jurisdictional limitations</h3>
      <p>
        Some jurisdictions do not allow the exclusion of implied warranties or the limitation of liability
        for incidental or consequential damages. In such jurisdictions, our liability is limited to the
        greatest extent permitted by applicable law. Nothing in these Terms excludes or limits liability
        for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation.
      </p>

      <h2>Indemnification</h2>

      <h3>Your indemnification obligations</h3>
      <p>
        You agree to indemnify, defend, and hold harmless Aura Technologies Inc., its affiliates, officers,
        directors, employees, agents, and licensors from and against any and all claims, liabilities,
        damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or
        relating to: (a) your use of the Platform; (b) content you create, publish, or distribute through
        the Platform; (c) your violation of these Terms; (d) your violation of any applicable law or
        third-party right; or (e) any dispute between you and a third party relating to your use of the
        Platform.
      </p>

      <h3>Indemnification procedure</h3>
      <p>
        Aura will provide you with prompt written notice of any claim subject to indemnification (provided
        that failure to provide timely notice shall not relieve your obligations except to the extent you
        are materially prejudiced). You shall have the right to control the defense and settlement of any
        such claim, provided that you may not settle any claim that imposes obligations on Aura or admits
        fault on behalf of Aura without our prior written consent.
      </p>

      <h2>Termination</h2>

      <h3>Termination by you</h3>
      <p>
        You may terminate your account at any time through your workspace settings or by contacting support.
        Termination takes effect at the end of your current billing period. You will retain access to the
        Platform until the end of the paid period. After termination, a 30-day data export window applies
        as described in the Data Ownership section above.
      </p>

      <h3>Termination by Aura</h3>
      <p>
        We may suspend or terminate your account immediately upon written notice if: (a) you materially
        breach these Terms and fail to cure the breach within 15 days of notice; (b) you engage in
        activity that poses a security threat to the Platform or other users; (c) your subscription
        payment fails after two failed retry attempts and 10 days&apos; written notice; or (d) we are
        required to do so by law. We may also discontinue the Platform entirely with 90 days&apos;
        advance notice.
      </p>

      <h3>Effect of termination</h3>
      <p>
        Upon termination, your right to access the Platform ceases immediately (or at the end of the
        billing period for voluntary termination). Provisions that by their nature should survive
        termination shall survive, including but not limited to: Data Ownership, Intellectual Property,
        Limitation of Liability, Indemnification, Dispute Resolution, and Governing Law.
      </p>

      <h2>Dispute Resolution</h2>

      <h3>Informal resolution</h3>
      <p>
        Before initiating any formal dispute resolution proceeding, you agree to first attempt to resolve
        any dispute informally by contacting us at <a href="mailto:legal@aura.ai">legal@aura.ai</a>. We
        will attempt to resolve the dispute through good-faith negotiation within 30 days. Most disputes
        can be resolved quickly and to both parties&apos; satisfaction through this process.
      </p>

      <h3>Binding arbitration</h3>
      <p>
        If we cannot resolve a dispute informally within 30 days, either party may initiate binding
        arbitration administered by JAMS under its Comprehensive Arbitration Rules. The arbitration
        shall take place in New York, New York, before a single arbitrator. The arbitrator&apos;s decision
        shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
        Each party shall bear its own costs, and the parties shall share the arbitration fees equally.
      </p>

      <h3>Class action waiver</h3>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOU AND AURA AGREE THAT EACH PARTY MAY BRING CLAIMS
        AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER
        IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. The arbitrator may not consolidate
        more than one party&apos;s claims and may not preside over any form of class or representative
        proceeding.
      </p>

      <h2>Governing Law</h2>

      <h3>Applicable law</h3>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State of New York,
        United States of America, without regard to its conflict of law provisions. For any claims not
        subject to arbitration, you consent to the exclusive jurisdiction and venue of the state and federal
        courts located in New York County, New York.
      </p>

      <h3>Severability</h3>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining
        provisions shall continue in full force and effect. The invalid provision shall be modified to the
        minimum extent necessary to make it valid and enforceable while preserving the parties&apos; original
        intent.
      </p>

      <h3>Entire agreement</h3>
      <p>
        These Terms, together with the Privacy Policy, Data Processing Agreement, and any applicable order
        forms or subscription agreements, constitute the entire agreement between you and Aura regarding the
        Platform and supersede all prior agreements, representations, and understandings. No waiver of any
        provision shall be effective unless in writing and signed by the waiving party.
      </p>

      <h2>Contact</h2>
      <p>For questions about these Terms of Service, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:legal@aura.ai">legal@aura.ai</a></li>
        <li><strong>Support:</strong> <a href="mailto:support@aura.ai">support@aura.ai</a></li>
        <li><strong>Address:</strong> Aura Technologies Inc., 350 Fifth Avenue, Suite 4500, New York, NY 10118</li>
        <li><strong>Phone:</strong> +1 (212) 555-0142</li>
      </ul>
    </LegalPageLayout>
  );
}
