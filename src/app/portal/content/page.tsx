import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalContentPage() {
  // Mock published content — in production, query content_drafts where clientId matches + status=published
  const content = [
    { id: 'c1', title: '5 Tips for Social Media Growth', type: 'blog_post', channel: 'blog', publishedAt: '2026-03-28', engagement: 245 },
    { id: 'c2', title: 'Spring Campaign Launch Post', type: 'social_post', channel: 'linkedin', publishedAt: '2026-03-25', engagement: 189 },
    { id: 'c3', title: 'March Newsletter', type: 'email_newsletter', channel: 'email', publishedAt: '2026-03-20', engagement: 142 },
    { id: 'c4', title: 'Product Feature Spotlight', type: 'social_post', channel: 'instagram', publishedAt: '2026-03-18', engagement: 312 },
    { id: 'c5', title: 'Industry Trends Video Script', type: 'video_script', channel: 'youtube', publishedAt: '2026-03-15', engagement: 98 },
  ];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="portal-content">
      <h1 className="text-heading-xl font-display text-foreground">Published Content</h1>
      <p className="text-body-sm text-muted-foreground">Content published for your brand across all channels.</p>

      <div className="space-y-3">
        {content.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <Eye className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-ui text-sm font-medium">{item.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">{item.channel}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.type.replace('_', ' ')}</Badge>
                    <span className="text-[11px] text-muted-foreground">{item.publishedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-body-sm text-muted-foreground">{item.engagement} engagements</span>
                <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
