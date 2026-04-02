import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';

export default function PortalReviewPage() {
  // Mock pending reviews — in production, query approvals where current stage is client review
  const pendingReviews = [
    { id: 'a1', title: 'April Social Media Calendar', type: 'social_post', submittedAt: '2026-03-30', submittedBy: 'Casey (Account Manager)' },
    { id: 'a2', title: 'Q2 Blog Content Plan', type: 'blog_post', submittedAt: '2026-03-28', submittedBy: 'Jamie (Content Lead)' },
  ];

  const completedReviews = [
    { id: 'a3', title: 'March Newsletter', type: 'email_newsletter', decision: 'approved', decidedAt: '2026-03-20' },
    { id: 'a4', title: 'Brand Refresh Social Pack', type: 'social_post', decision: 'changes_requested', decidedAt: '2026-03-15', feedback: 'Please use updated logo' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="portal-review">
      <h1 className="text-heading-xl font-display text-foreground">Content Review</h1>
      <p className="text-body-sm text-muted-foreground">Review and provide feedback on content your agency has prepared.</p>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="size-5 text-yellow-500" />
              Awaiting Your Review ({pendingReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-ui text-sm font-medium">{review.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{review.type.replace('_', ' ')}</Badge>
                    <span className="text-[11px] text-muted-foreground">by {review.submittedBy} · {review.submittedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10">
                    <CheckCircle className="size-3.5 mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10">
                    <MessageSquare className="size-3.5 mr-1" />Request Changes
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                    <XCircle className="size-3.5 mr-1" />Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Review History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedReviews.map((review) => (
            <div key={review.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-ui text-sm text-foreground">{review.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{review.type.replace('_', ' ')}</Badge>
                  <span className="text-[11px] text-muted-foreground">{review.decidedAt}</span>
                </div>
                {review.feedback && <p className="text-[11px] text-muted-foreground mt-1">Feedback: {review.feedback}</p>}
              </div>
              <Badge className={review.decision === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}>
                {review.decision.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
