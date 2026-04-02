import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEATURE_FLAGS = [
  { id: 'ai_content_generation', label: 'AI Content Generation', enabled: true, description: 'Claude API for F1 content creation' },
  { id: 'social_publishing', label: 'Social Publishing', enabled: false, description: 'Real platform API publishing (requires OAuth)' },
  { id: 'image_generation', label: 'Image Generation', enabled: false, description: 'Vertex AI image generation' },
  { id: 'email_sending', label: 'Email Sending', enabled: false, description: 'SendGrid/Resend email delivery' },
  { id: 'stripe_billing', label: 'Stripe Billing', enabled: false, description: 'Real Stripe checkout and subscriptions' },
  { id: 'seo_api', label: 'SEO API', enabled: false, description: 'DataForSEO keyword research' },
  { id: 'analytics_sync', label: 'Analytics Sync', enabled: false, description: 'Real platform metrics polling' },
  { id: 'white_label_reports', label: 'White-Label Reports', enabled: false, description: 'PDF report generation' },
];

export default async function AdminFeatureFlagsPage() {
  const auth = await requirePlatformAuth('feature_flags.toggle_global');
  if (!auth) redirect('/sign-in');

  return (
    <div className="space-y-6" data-testid="admin-feature-flags">
      <h1 className="text-heading-xl font-display text-foreground">Feature Flags</h1>
      <p className="text-body-sm text-muted-foreground">Toggle features globally or per-workspace. Disabled features use mock data.</p>
      <div className="space-y-3">
        {FEATURE_FLAGS.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-ui text-sm font-medium">{flag.label}</p>
                <p className="text-[11px] text-muted-foreground">{flag.description}</p>
              </div>
              <Badge className={flag.enabled ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}>{flag.enabled ? 'Enabled' : 'Disabled'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
