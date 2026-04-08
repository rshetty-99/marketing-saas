'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface BlogComment {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt?: { _seconds: number };
}

interface BlogCommentsProps {
  postId: string;
  workspaceId: string;
  initialComments: BlogComment[];
}

export function BlogComments({ postId, workspaceId, initialComments }: BlogCommentsProps) {
  const { user, isSignedIn } = useUser();
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!commentText.trim() || submitting || !isSignedIn) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText,
          workspaceId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to post comment' }));
        setError((data as Record<string, string>).error ?? 'Failed to post comment');
        return;
      }

      const data = await res.json() as Record<string, unknown>;
      setComments((prev) => [
        ...prev,
        {
          id: data.commentId as string,
          content: commentText,
          authorName: user?.fullName ?? user?.firstName ?? 'You',
          authorAvatar: user?.imageUrl,
          createdAt: { _seconds: Math.floor(Date.now() / 1000) },
        },
      ]);
      setCommentText('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [commentText, submitting, isSignedIn, postId, workspaceId, user]);

  return (
    <div data-testid="blog-comments">
      <h2 className="font-display font-semibold text-xl text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="size-5" />
        Comments ({comments.length})
      </h2>

      {/* Comment list */}
      <div className="space-y-4 mb-8">
        {comments.map((comment) => {
          const initials = comment.authorName
            ? comment.authorName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '??';

          const dateStr = comment.createdAt
            ? new Date(comment.createdAt._seconds * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '';

          return (
            <Card key={comment.id} data-testid="blog-comment-item">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/70 to-brand-indigo/70 text-[10px] font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <span className="font-ui text-sm font-medium text-foreground">
                    {comment.authorName}
                  </span>
                  {dateStr && (
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed pl-9">
                  {comment.content}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>

      {/* Add comment */}
      {isSignedIn ? (
        <div className="space-y-2">
          <div className="flex gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-h-[80px] rounded-lg border border-input bg-input/20 p-3 font-ui text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 resize-y"
              data-testid="blog-comment-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!commentText.trim() || submitting}
              data-testid="blog-comment-submit"
            >
              {submitting ? (
                <><Loader2 className="size-4 mr-1.5 animate-spin" />Posting...</>
              ) : (
                <><Send className="size-4 mr-1.5" />Post Comment</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">
          Sign in to leave a comment.
        </p>
      )}
    </div>
  );
}
