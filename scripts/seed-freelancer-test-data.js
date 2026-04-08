const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccount = require('../aura-saas-firebase-adminsdk-fbsvc-60901e9ecc.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
const { FieldValue } = admin.firestore;
const WS = 'org_3Biy9zwRZhGOGzjWUclmlL2TE4X';
const USER = 'user_3Biy9rNASt4HVeLTSj0AIBLi8UF';

async function seed() {
  const now = FieldValue.serverTimestamp();

  // 1. Update entity profile with brand voice
  await db.collection('entity_profiles').doc(WS).set({
    workspaceId: WS, accountType: 'freelancer',
    businessName: 'Alex Marketing Studio',
    legalName: 'Alex Freelance Photography LLC',
    industry: 'Photography & Creative Services',
    website: 'https://alexfreelance.com',
    phone: '+1-555-0101',
    description: 'Creative photography and content production studio specializing in brand photography, product shoots, and social media content for small businesses.',
    companySize: '1',
    address: { street: '456 Creative Ave', city: 'Austin', state: 'TX', zip: '78701', country: 'US' },
    socialLinks: { instagram: 'https://instagram.com/alexcreates', linkedin: 'https://linkedin.com/in/alexfreelance' },
    brandVoice: {
      tone: 'friendly', personalityTraits: ['creative', 'authentic', 'approachable'],
      formalityLevel: 4, toneDescriptors: ['warm', 'visual', 'inspiring'],
      emojiPolicy: 'moderate', targetAudience: 'Small business owners and startups looking for professional photography and content',
      personality: 'Creative, approachable, and passionate about visual storytelling'
    },
    contentStrategy: {
      targetAudience: 'Small business owners, startups, e-commerce brands needing professional photography',
      contentPillars: ['behind_the_scenes', 'portfolio_showcase', 'tips_and_tutorials', 'client_stories'],
      postingFrequency: { instagram: 5, linkedin: 2, twitter: 3 }
    },
    aiDefaults: { aiCreativityLevel: 'creative', defaultContentLength: 'medium', defaultTone: 'friendly' },
    createdAt: now, updatedAt: now, createdBy: USER
  }, { merge: true });
  console.log('1. Entity profile updated with brand voice');

  // 2. Create 5 content drafts
  const contents = [
    { title: 'Behind the Scenes: Product Photography Setup', contentType: 'blog_post', channel: 'blog', status: 'published', content: 'Today I want to share my go-to setup for product photography. Whether you are shooting jewelry, food, or tech products, these fundamentals will help you create stunning images that sell. My studio setup starts with two key lights and a simple white backdrop...', seoMetaTitle: 'Product Photography Setup Guide | Alex Marketing Studio' },
    { title: '5 Tips for Better Instagram Product Photos', contentType: 'social_post', channel: 'instagram', status: 'published', content: 'Want to level up your product photos? Here are my top 5 tips:\n\n1. Natural light is your best friend\n2. Use a clean, consistent background\n3. Show scale with everyday objects\n4. Shoot from multiple angles\n5. Edit consistently with presets\n\nWhich tip are you trying first? #ProductPhotography #SmallBusinessTips', seoMetaTitle: '5 Tips Better Instagram Product Photos' },
    { title: 'Why Every Small Business Needs Professional Photography', contentType: 'blog_post', channel: 'linkedin', status: 'draft', content: 'In today\'s visual-first world, professional photography isn\'t a luxury — it\'s a necessity. Studies show that listings with professional photos get 118% more views. For small businesses competing against bigger brands, high-quality imagery is the great equalizer.', seoMetaTitle: 'Why Small Business Needs Professional Photography' },
    { title: 'Spring Portfolio Update — New Client Work', contentType: 'social_post', channel: 'instagram', status: 'scheduled', content: 'Spring is here and so is a fresh batch of client work! Swipe to see my favorite shots from Q1 2026. From food photography for The Bake Shop to lifestyle shots for FitBody Gym — every project tells a unique story.\n\n#PortfolioUpdate #AustinPhotographer #BrandPhotography', seoMetaTitle: null },
    { title: 'How I Edit Photos in Under 10 Minutes', contentType: 'video_script', channel: 'youtube', status: 'draft', content: 'Hey everyone! In this video I\'m going to show you my complete editing workflow that takes under 10 minutes per photo. I use Lightroom with custom presets and a few Photoshop tricks that will save you hours every week.' , seoMetaTitle: 'Photo Editing Workflow Under 10 Minutes' }
  ];
  for (const c of contents) {
    const ref = db.collection('workspaces').doc(WS).collection('content_drafts').doc();
    await ref.set({
      id: ref.id, workspaceId: WS, ...c,
      publishedAt: c.status === 'published' ? now : null,
      createdAt: now, updatedAt: now, createdBy: USER
    });
  }
  console.log('2. 5 content drafts created');

  // 3. Create 3 leads
  const leads = [
    { email: 'sarah@bakeshop.com', firstName: 'Sarah', lastName: 'Johnson', company: 'The Bake Shop', jobTitle: 'Owner', stage: 'qualified', score: 4 },
    { email: 'mike@fitnessgym.com', firstName: 'Mike', lastName: 'Chen', company: 'FitBody Gym', jobTitle: 'Marketing Manager', stage: 'new', score: 2 },
    { email: 'lisa@boutiquestore.com', firstName: 'Lisa', lastName: 'Park', company: 'Boutique & Co', jobTitle: 'Founder', stage: 'contacted', score: 3 }
  ];
  for (const l of leads) {
    const ref = db.collection('workspaces').doc(WS).collection('leads').doc();
    await ref.set({
      id: ref.id, workspaceId: WS, ...l, enriched: false, tags: ['photography_client'],
      source: { type: 'direct', referrerUrl: 'https://alexfreelance.com' },
      notes: [], createdAt: now, updatedAt: now, createdBy: USER
    });
  }
  console.log('3. 3 leads created');

  // 4. Create 1 email campaign
  const emailRef = db.collection('workspaces').doc(WS).collection('email_campaigns').doc();
  await emailRef.set({
    id: emailRef.id, workspaceId: WS, name: 'Spring Photography Promo',
    subject: 'Book Your Spring Shoot — 20% Off!',
    previewText: 'Limited time offer for new clients',
    fromName: 'Alex Marketing Studio', fromEmail: 'hello@alexfreelance.com',
    status: 'draft', dataSource: 'mock',
    htmlContent: '<h1>Spring Special</h1><p>Book your spring photoshoot and save 20%!</p>',
    compliance: { physicalAddress: '456 Creative Ave, Austin TX', unsubscribeUrl: '/unsubscribe', unsubscribeLinkPresent: true },
    createdAt: now, updatedAt: now, createdBy: USER
  });
  console.log('4. 1 email campaign created');

  // 5. Create 2 calendar events
  const cal1 = db.collection('workspaces').doc(WS).collection('calendar_events').doc();
  await cal1.set({
    id: cal1.id, workspaceId: WS, title: 'Instagram Post: Spring Portfolio',
    type: 'publish_schedule', platform: 'instagram',
    startDate: new Date('2026-04-10T09:00:00Z'), endDate: new Date('2026-04-10T09:30:00Z'),
    createdAt: now, updatedAt: now, createdBy: USER
  });
  const cal2 = db.collection('workspaces').doc(WS).collection('calendar_events').doc();
  await cal2.set({
    id: cal2.id, workspaceId: WS, title: 'Blog Post Due: Product Photography Tips',
    type: 'content_due', platform: 'blog',
    startDate: new Date('2026-04-12T14:00:00Z'), endDate: new Date('2026-04-12T15:00:00Z'),
    createdAt: now, updatedAt: now, createdBy: USER
  });
  console.log('5. 2 calendar events created');

  // 6. Create 1 SEO report
  const seoRef = db.collection('workspaces').doc(WS).collection('seo_reports').doc();
  await seoRef.set({
    id: seoRef.id, workspaceId: WS, type: 'on_page_audit',
    targetKeyword: 'product photography tips',
    onPageScore: { overallScore: 78, titleScore: 85, metaScore: 70, headingScore: 80, keywordDensity: 2.1, readabilityScore: 75, suggestions: [
      { type: 'meta', severity: 'warning', message: 'Meta description is missing', suggestion: 'Add a 150-160 character meta description' },
      { type: 'keyword_density', severity: 'info', message: 'Keyword density is good at 2.1%', suggestion: 'No changes needed' }
    ]},
    generatedAt: now, createdAt: now, updatedAt: now, createdBy: USER
  });
  console.log('6. 1 SEO report created');

  // 7. Update profile score
  await db.collection('workspaces').doc(WS).collection('profile_score').doc('current').set({
    score: 40, maxScore: 100,
    completedActions: ['workspace_created', 'brand_configured', 'profile_updated', 'first_content'],
    updatedAt: now
  });
  console.log('7. Profile score updated to 40%');

  // 8. Create listening mentions
  const mentions = [
    { platform: 'instagram', content: 'Just had an amazing photoshoot with @alexcreates! Highly recommend for product photography.', author: '@bakeshop_sarah', sentiment: { label: 'positive', score: 0.85 }, status: 'new' },
    { platform: 'linkedin', content: 'Looking for a photographer in Austin area for our startup headshots. Any recommendations?', author: 'David Tech', sentiment: { label: 'neutral', score: 0.1 }, status: 'new' },
  ];
  for (const m of mentions) {
    const ref = db.collection('workspaces').doc(WS).collection('listening_feed').doc();
    await ref.set({ id: ref.id, workspaceId: WS, ...m, detectedAt: now, createdAt: now, updatedAt: now });
  }
  console.log('8. 2 listening mentions created');

  // 9. Create 2 DAM assets
  const dam1 = db.collection('workspaces').doc(WS).collection('dam_assets').doc();
  await dam1.set({
    id: dam1.id, workspaceId: WS, name: 'Studio Logo', assetType: 'logo',
    mimeType: 'image/png', fileUrl: 'https://placehold.co/400x400/FF4D00/white?text=A',
    fileSizeBytes: 45000, status: 'active', usageCount: 3,
    tags: [{ tag: 'logo', source: 'manual' }, { tag: 'brand', source: 'manual' }],
    currentVersionNumber: 1, versions: [], linkedContentIds: [], linkedCampaignIds: [],
    createdAt: now, updatedAt: now, createdBy: USER
  });
  const dam2 = db.collection('workspaces').doc(WS).collection('dam_assets').doc();
  await dam2.set({
    id: dam2.id, workspaceId: WS, name: 'Product Shot - Bakery', assetType: 'image',
    mimeType: 'image/jpeg', fileUrl: 'https://placehold.co/1200x800/F5F0EB/0D0D12?text=Product+Shot',
    fileSizeBytes: 2500000, status: 'active', usageCount: 1,
    tags: [{ tag: 'product', source: 'manual' }, { tag: 'bakery', source: 'ai_generated', confidence: 0.92 }],
    currentVersionNumber: 1, versions: [], linkedContentIds: [], linkedCampaignIds: [],
    createdAt: now, updatedAt: now, createdBy: USER
  });
  console.log('9. 2 DAM assets created');

  // 10. Create subscriber
  const subRef = db.collection('workspaces').doc(WS).collection('email_subscribers').doc();
  await subRef.set({
    id: subRef.id, workspaceId: WS, email: 'sarah@bakeshop.com',
    firstName: 'Sarah', lastName: 'Johnson', status: 'subscribed',
    tags: ['client', 'photography'], source: 'manual',
    createdAt: now, updatedAt: now
  });
  console.log('10. 1 email subscriber created');

  console.log('\nAll test data seeded for freelancer!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
