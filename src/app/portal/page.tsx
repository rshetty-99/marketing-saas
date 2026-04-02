import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default async function PortalDashboardPage() {
  return (
    <div data-testid="portal-dashboard" className="flex flex-col gap-6 p-6">
      <h1 className="text-heading-xl font-display text-foreground">Client Portal</h1>
      <p className="text-body-sm text-muted-foreground">
        Welcome to your client portal. View reports, published content, and provide feedback.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/portal/reports">
          <Card className="hover:border-brand-orange/50 transition-colors cursor-pointer">
            <CardContent className="py-6 text-center">
              <FileText className="size-8 text-brand-orange mx-auto mb-3" />
              <p className="font-ui text-sm font-medium">Reports</p>
              <p className="text-[11px] text-muted-foreground mt-1">View generated reports</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/analytics">
          <Card className="hover:border-brand-orange/50 transition-colors cursor-pointer">
            <CardContent className="py-6 text-center">
              <BarChart3 className="size-8 text-blue-500 mx-auto mb-3" />
              <p className="font-ui text-sm font-medium">Analytics</p>
              <p className="text-[11px] text-muted-foreground mt-1">Live performance dashboard</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/content">
          <Card className="hover:border-brand-orange/50 transition-colors cursor-pointer">
            <CardContent className="py-6 text-center">
              <Eye className="size-8 text-green-500 mx-auto mb-3" />
              <p className="font-ui text-sm font-medium">Content</p>
              <p className="text-[11px] text-muted-foreground mt-1">Published content gallery</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/review" data-testid="portal-review-link">
          <Card className="hover:border-brand-orange/50 transition-colors cursor-pointer">
            <CardContent className="py-6 text-center">
              <MessageSquare className="size-8 text-purple-500 mx-auto mb-3" />
              <p className="font-ui text-sm font-medium">Review</p>
              <Badge variant="outline" className="text-[10px] mt-1">Feedback</Badge>
              <p className="text-[11px] text-muted-foreground mt-1">Approve or request changes</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
