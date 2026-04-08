const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccount = require('../aura-saas-firebase-adminsdk-fbsvc-60901e9ecc.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
const { FieldValue } = admin.firestore;

// Blog posts go in the Rajesh Agency workspace (the BLOG_WORKSPACE_ID)
const WS = 'org_3BrAQY4IeIQF7yjqSP74lqSF2jT';

const BLOG_POSTS = [
  {
    title: 'How AI Is Transforming Content Marketing for Agencies in 2026',
    slug: 'ai-transforming-content-marketing-2026',
    excerpt: 'Artificial intelligence is no longer a buzzword — it\'s the backbone of modern agency workflows. Here\'s how the smartest agencies are using AI to 10x their output without 10x their team.',
    contentHtml: `<h2>The AI Revolution in Agency Marketing</h2>
<p>Two years ago, AI-generated content was a novelty. Today, it's a necessity. Agencies managing 20+ clients simply cannot scale without AI assistance — and the data proves it.</p>
<p>According to our internal data, agencies using AI content tools produce <strong>3.2x more content</strong> per team member compared to those relying solely on manual creation.</p>
<h2>Five Ways Agencies Are Using AI Right Now</h2>
<h3>1. First-Draft Generation</h3>
<p>The biggest time sink in content creation isn't the final polish — it's staring at a blank page. AI eliminates writer's block by generating structured first drafts that your team refines and personalizes.</p>
<h3>2. Multi-Platform Repurposing</h3>
<p>One blog post becomes a LinkedIn article, three tweets, an Instagram carousel, and an email newsletter — all adapted for each platform's audience and format. What used to take 3 hours now takes 15 minutes.</p>
<h3>3. SEO Optimization in Real-Time</h3>
<p>AI-powered SEO scoring analyzes your content as you write, suggesting keyword placement, meta descriptions, and heading structure before you hit publish.</p>
<h3>4. Brand Voice Consistency</h3>
<p>When you're managing content for 30 different brands, maintaining each one's unique voice is challenging. AI learns each brand's tone, vocabulary, and personality — ensuring every piece sounds authentically on-brand.</p>
<h3>5. Performance Prediction</h3>
<p>Before publishing, AI can predict engagement rates based on historical data, helping teams prioritize high-impact content and optimize underperformers.</p>
<h2>The Bottom Line</h2>
<p>AI isn't replacing marketers. It's replacing the tedious parts of marketing so your team can focus on strategy, creativity, and client relationships. The agencies that embrace this shift will outpace those that don't.</p>
<p><em>Ready to see AI in action? <a href="/sign-up">Start your free trial</a> and experience the difference.</em></p>`,
    category: 'ai_marketing',
    tags: ['ai', 'content-marketing', 'agency-growth', 'productivity'],
    author: { userId: 'user_3BjBxsmLFjM0klk7Otx1vJRjkuU', name: 'Rajesh Shetty', role: 'Founder & CEO', bio: 'Building Aura.ai — the AI marketing platform for agencies.' },
    coverImageUrl: 'https://placehold.co/1200x628/FF4D00/FFFFFF?text=AI+Content+Marketing+2026',
    coverImageAlt: 'AI transforming content marketing illustration',
    featured: true,
    wordCount: 342,
    readTimeMinutes: 2,
    seoTitle: 'How AI Is Transforming Content Marketing for Agencies in 2026',
    seoDescription: 'Discover how the smartest marketing agencies use AI to produce 3.2x more content, maintain brand voice across 30 clients, and predict engagement.',
    views: 1847,
    uniqueVisitors: 1203,
    likes: 89,
  },
  {
    title: 'The Complete Guide to Social Media Publishing in 2026',
    slug: 'complete-guide-social-media-publishing-2026',
    excerpt: 'Managing 8 platforms, 30 clients, and hundreds of posts per month? Here\'s the definitive playbook for social media publishing at scale.',
    contentHtml: `<h2>Social Media Publishing at Scale</h2>
<p>If you're still copying and pasting content between platforms, you're leaving hours on the table every week. Modern social media publishing requires a unified approach.</p>
<h2>The 8-Platform Strategy</h2>
<p>In 2026, a complete social presence spans LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube, Pinterest, and Google Business. Each platform has unique formatting requirements, optimal posting times, and audience expectations.</p>
<h3>Platform-Specific Best Practices</h3>
<ul>
<li><strong>LinkedIn:</strong> Professional tone, 150-300 words, publish Tue-Thu 8-10am</li>
<li><strong>Instagram:</strong> Visual-first, 100-200 word captions, 5-10 hashtags</li>
<li><strong>Twitter/X:</strong> Punchy, max 280 chars, 1-2 hashtags, high frequency</li>
<li><strong>TikTok:</strong> Authentic, trend-aware, 15-60 second videos</li>
</ul>
<h2>The Content Calendar Framework</h2>
<p>A well-organized content calendar is the backbone of consistent publishing. We recommend the 4-1-1 rule: for every 4 educational posts, share 1 curated piece and 1 promotional post.</p>
<p>Use scheduling tools that allow you to queue content in advance, preview how posts will look on each platform, and track performance from a single dashboard.</p>
<h2>Measuring What Matters</h2>
<p>Don't obsess over vanity metrics. Focus on engagement rate, click-through rate, and conversion attribution. These tell you whether your content is actually driving business results.</p>`,
    category: 'social_media',
    tags: ['social-media', 'publishing', 'content-calendar', 'multi-platform'],
    author: { userId: 'author_2', name: 'Sarah Chen', role: 'Head of Content', bio: 'Content strategist with 10 years of agency experience.' },
    coverImageUrl: 'https://placehold.co/1200x628/4F35F5/FFFFFF?text=Social+Media+Publishing',
    coverImageAlt: 'Social media publishing guide',
    featured: false,
    wordCount: 287,
    readTimeMinutes: 2,
    seoTitle: 'Complete Guide to Social Media Publishing 2026 | Multi-Platform Strategy',
    seoDescription: 'Master social media publishing across 8 platforms. Learn platform-specific best practices, content calendar frameworks, and performance measurement.',
    views: 923,
    uniqueVisitors: 654,
    likes: 45,
  },
  {
    title: 'Why We Built Aura: The Problem with Marketing Tool Sprawl',
    slug: 'why-we-built-aura-marketing-tool-sprawl',
    excerpt: 'The average agency uses 12-15 different marketing tools. We built Aura because we were tired of context-switching between them.',
    contentHtml: `<h2>The 15-Tool Problem</h2>
<p>When I started my first agency, I used Hootsuite for scheduling, Canva for design, Mailchimp for email, HubSpot for CRM, SEMrush for SEO, Google Analytics for data, Asana for projects, Slack for communication, and about 7 other tools I can't even remember.</p>
<p>The monthly bill? Over $2,000. The context-switching cost? Immeasurable.</p>
<h2>What We Learned</h2>
<p>After talking to 200+ agency owners, we discovered that the #1 complaint wasn't about any single tool being bad. It was about the friction of moving between tools. Every tool has its own login, its own dashboard, its own way of doing things. Data lives in silos. Reports require manual assembly.</p>
<h2>The Aura Approach</h2>
<p>We built Aura as a single platform that handles the complete marketing workflow:</p>
<ol>
<li><strong>Create</strong> — AI-powered content generation with brand voice</li>
<li><strong>Publish</strong> — Multi-platform scheduling and publishing</li>
<li><strong>Analyze</strong> — Cross-platform analytics in one dashboard</li>
<li><strong>Report</strong> — White-label client reports, auto-generated</li>
<li><strong>Manage</strong> — Team, clients, approvals, and billing</li>
</ol>
<p>One platform. One login. One workflow. Zero context switching.</p>
<h2>The Result</h2>
<p>Our early users report saving an average of 15 hours per week. That's almost 2 full workdays. Time they now spend on strategy, creativity, and client relationships — the things that actually grow an agency.</p>`,
    category: 'product_updates',
    tags: ['product', 'agency', 'tool-consolidation', 'founders-story'],
    author: { userId: 'user_3BjBxsmLFjM0klk7Otx1vJRjkuU', name: 'Rajesh Shetty', role: 'Founder & CEO', bio: 'Building Aura.ai — the AI marketing platform for agencies.' },
    coverImageUrl: 'https://placehold.co/1200x628/0D0D12/FF4D00?text=Why+We+Built+Aura',
    coverImageAlt: 'Why we built Aura',
    featured: false,
    wordCount: 298,
    readTimeMinutes: 2,
    seoTitle: 'Why We Built Aura: Solving Marketing Tool Sprawl for Agencies',
    seoDescription: 'The average agency uses 15 tools. We built Aura to consolidate them into one platform. Here\'s our story and what we learned from 200+ agency owners.',
    views: 2341,
    uniqueVisitors: 1876,
    likes: 134,
  },
  {
    title: 'SEO in the Age of AI: What Still Works in 2026',
    slug: 'seo-age-of-ai-what-works-2026',
    excerpt: 'Google\'s algorithms have evolved dramatically with AI. Here\'s what actually moves the needle for SEO in 2026 — and what\'s now a waste of time.',
    contentHtml: `<h2>SEO Has Changed. Has Your Strategy?</h2>
<p>The SEO playbook from 2023 is obsolete. Google's AI-powered search (SGE) has fundamentally changed how content gets discovered, ranked, and consumed. Here's what's working now.</p>
<h2>What Still Works</h2>
<h3>Topical Authority</h3>
<p>Creating comprehensive content clusters around your core topics signals expertise. One killer article isn't enough — you need depth across the entire topic.</p>
<h3>E-E-A-T (Experience, Expertise, Authoritativeness, Trust)</h3>
<p>Google's quality raters are more focused than ever on real expertise. Content by practitioners outranks content by generalists. Share real data, case studies, and firsthand experience.</p>
<h3>Technical SEO Fundamentals</h3>
<p>Core Web Vitals, mobile performance, structured data, and clean architecture remain critical. These are table stakes, not differentiators.</p>
<h2>What's Changed</h2>
<h3>AI Overviews Steal Clicks</h3>
<p>Google's AI-generated overviews now appear for 40% of queries. To earn clicks, your content must offer something the AI summary can't: original research, unique perspectives, interactive tools, or in-depth analysis.</p>
<h3>Long-Tail Is the New Mainstream</h3>
<p>With AI answering simple queries, the value has shifted to complex, nuanced topics where human expertise shines. Target the questions AI can't fully answer.</p>`,
    category: 'seo_content',
    tags: ['seo', 'ai-search', 'google', 'content-strategy', 'e-e-a-t'],
    author: { userId: 'author_3', name: 'James Liu', role: 'SEO Lead', bio: 'Data-driven SEO strategist focused on AI-era search optimization.' },
    coverImageUrl: 'https://placehold.co/1200x628/00E5FF/0D0D12?text=SEO+in+2026',
    coverImageAlt: 'SEO in the age of AI',
    featured: false,
    wordCount: 312,
    readTimeMinutes: 2,
    seoTitle: 'SEO in 2026: What Works, What\'s Changed, and What to Stop Doing',
    seoDescription: 'Google\'s AI search has changed SEO forever. Learn what still works (topical authority, E-E-A-T) and what\'s obsolete in this 2026 SEO guide.',
    views: 1567,
    uniqueVisitors: 1102,
    likes: 78,
  },
  {
    title: 'Case Study: How Bloom Digital Grew 340% Using Aura',
    slug: 'case-study-bloom-digital-340-percent-growth',
    excerpt: 'Bloom Digital went from 8 to 35 clients in 6 months. Here\'s exactly how they used Aura to scale without adding headcount.',
    contentHtml: `<h2>The Challenge</h2>
<p>Bloom Digital is a boutique social media agency based in Portland. In January 2026, they managed 8 clients with a team of 4. Their process was manual — spreadsheets for scheduling, Canva for design, individual platform logins for publishing.</p>
<p>"We were maxed out," says CEO Sarah Chen. "Taking on even one more client meant hiring, and we weren't ready for that overhead."</p>
<h2>The Solution</h2>
<p>Bloom switched to Aura in February 2026. Within the first week, they:</p>
<ul>
<li>Connected all 8 clients' social accounts through the integrations hub</li>
<li>Set up brand voice profiles for each client using the AI voice analyzer</li>
<li>Migrated their content calendar from Google Sheets</li>
<li>Generated a month's worth of content for 3 clients in a single afternoon</li>
</ul>
<h2>The Results (6 Months Later)</h2>
<blockquote><p>"We went from 8 to 35 clients without hiring a single person. Aura handles the heavy lifting — we focus on strategy."</p></blockquote>
<p>Key metrics:</p>
<ul>
<li><strong>340% client growth</strong> (8 → 35 clients)</li>
<li><strong>15 hours/week saved</strong> on content creation</li>
<li><strong>23% higher engagement</strong> across all client accounts</li>
<li><strong>$14,000/month saved</strong> by consolidating 6 tools into Aura</li>
</ul>
<h2>Key Takeaway</h2>
<p>Scaling an agency isn't about hiring more people — it's about giving your existing team better tools. Bloom Digital proved that the right platform can 4x your capacity without 4x your cost.</p>`,
    category: 'case_studies',
    tags: ['case-study', 'agency-growth', 'social-media', 'scaling', 'roi'],
    author: { userId: 'author_4', name: 'Emily Park', role: 'Customer Success Lead', bio: 'Helping agencies unlock their growth potential with Aura.' },
    coverImageUrl: 'https://placehold.co/1200x628/BFFF00/0D0D12?text=340%25+Growth',
    coverImageAlt: 'Bloom Digital case study - 340% growth',
    featured: true,
    wordCount: 328,
    readTimeMinutes: 2,
    seoTitle: 'Case Study: Bloom Digital Grew 340% in 6 Months with Aura',
    seoDescription: 'How Bloom Digital scaled from 8 to 35 clients in 6 months using Aura. See the exact playbook, metrics, and ROI from this agency case study.',
    views: 3102,
    uniqueVisitors: 2456,
    likes: 201,
  },
  {
    title: 'Email Marketing Isn\'t Dead — You\'re Just Doing It Wrong',
    slug: 'email-marketing-not-dead-doing-it-wrong',
    excerpt: 'Email has a 4200% ROI — higher than any other marketing channel. Here\'s why most marketers fail at it and how to fix your strategy.',
    contentHtml: `<h2>The Most Underrated Channel</h2>
<p>Every year, someone declares email marketing dead. And every year, the data proves them wrong. Email generates $42 for every $1 spent — a 4200% ROI. No social platform comes close.</p>
<p>So why do so many marketers struggle with it?</p>
<h2>The 5 Mistakes Killing Your Email</h2>
<h3>1. Sending Without Segmentation</h3>
<p>Blasting the same email to your entire list is the fastest way to land in spam. Segment by behavior (opened last 30 days), interest (product category), and lifecycle stage (new vs. loyal).</p>
<h3>2. Ignoring Mobile</h3>
<p>67% of emails are opened on mobile. If your email isn't responsive, you're losing two-thirds of your audience before they read a word.</p>
<h3>3. No Clear CTA</h3>
<p>One email, one goal. If your reader has to choose between 5 different links, they'll choose none. Make the primary action obvious and compelling.</p>
<h3>4. Skipping A/B Testing</h3>
<p>Subject lines make or break your open rate. Test two variants on 20% of your list, then send the winner to the remaining 80%. Over time, this compounds dramatically.</p>
<h3>5. Not Cleaning Your List</h3>
<p>Dead subscribers hurt deliverability. Remove anyone who hasn't engaged in 90 days. A smaller, active list always outperforms a large, dormant one.</p>
<h2>The Fix</h2>
<p>Start with these 5 corrections and measure the impact over 30 days. Most agencies see a 40-60% improvement in open rates and a 2-3x increase in click-through rates within the first month.</p>`,
    category: 'email_marketing',
    tags: ['email-marketing', 'conversion', 'segmentation', 'a-b-testing', 'roi'],
    author: { userId: 'author_5', name: 'Ana Torres', role: 'Email Marketing Specialist', bio: 'Helping brands build email programs that actually convert.' },
    coverImageUrl: 'https://placehold.co/1200x628/FF2D55/FFFFFF?text=Email+Marketing+2026',
    coverImageAlt: 'Email marketing strategy guide',
    featured: false,
    wordCount: 345,
    readTimeMinutes: 2,
    seoTitle: 'Email Marketing Isn\'t Dead — 5 Mistakes Killing Your ROI (And How to Fix Them)',
    seoDescription: 'Email has a 4200% ROI but most marketers fail at it. Learn the 5 critical mistakes and how to fix your email strategy for 2-3x better results.',
    views: 1234,
    uniqueVisitors: 876,
    likes: 67,
  },
];

async function seed() {
  const now = FieldValue.serverTimestamp();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];
    const ref = db.collection('workspaces').doc(WS).collection('blog_posts').doc();
    const publishDate = new Date(thirtyDaysAgo.getTime() + i * 5 * 86400000); // Stagger by 5 days

    await ref.set({
      id: ref.id,
      workspaceId: WS,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: {}, // Tiptap JSON would go here
      contentHtml: post.contentHtml,
      coverImageUrl: post.coverImageUrl,
      coverImageAlt: post.coverImageAlt,
      coverImageStoragePath: null,
      category: post.category,
      tags: post.tags,
      author: post.author,
      status: 'published',
      publishedAt: admin.firestore.Timestamp.fromDate(publishDate),
      scheduledAt: null,
      wordCount: post.wordCount,
      readTimeMinutes: post.readTimeMinutes,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      ogImageUrl: post.coverImageUrl,
      canonicalUrl: null,
      noindex: false,
      focusKeyword: post.tags[0],
      seoScore: 75 + Math.floor(i * 3),
      featured: post.featured,
      allowComments: true,
      likes: post.likes,
      views: post.views,
      uniqueVisitors: post.uniqueVisitors,
      relatedPostIds: [],
      createdAt: admin.firestore.Timestamp.fromDate(publishDate),
      updatedAt: now,
      createdBy: post.author.userId,
    });

    console.log(`${i + 1}. "${post.title}" (${post.category}) by ${post.author.name}`);
  }

  console.log('\n6 blog posts published!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
