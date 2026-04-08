'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save, Repeat2, Send, Loader2, Zap, TrendingUp } from 'lucide-react';

interface ContentCreateClientProps {
  workspaceId: string;
  userId: string;
  userRole: string;
}

const CONTENT_TYPES = [
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'email_newsletter', label: 'Email Newsletter' },
  { value: 'email_sequence', label: 'Email Sequence' },
  { value: 'headline', label: 'Headline' },
  { value: 'ad_copy', label: 'Ad Copy' },
  { value: 'product_description', label: 'Product Description' },
  { value: 'video_script', label: 'Video Script' },
  { value: 'press_release', label: 'Press Release' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'landing_page_copy', label: 'Landing Page Copy' },
];

const CHANNELS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'blog', label: 'Blog' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
];

/**
 * Simple markdown to plain text for preview.
 * Uses text-based rendering to avoid dangerouslySetInnerHTML/XSS concerns.
 * A proper markdown renderer (react-markdown) should replace this in production.
 */
function markdownToPreviewText(md: string): string {
  return md
    .replace(/^### /gm, '')
    .replace(/^## /gm, '')
    .replace(/^# /gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^- /gm, '• ');
}

export function ContentCreateClient({ workspaceId, userId, userRole }: ContentCreateClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [channel, setChannel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const [generateError, setGenerateError] = useState<string | null>(null);

  // Autoresearch scoring state
  const [scores, setScores] = useState<{ name: string; score: number; feedback: string[] }[] | null>(null);
  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  async function handleScore(contentToScore: string) {
    if (!contentToScore.trim()) return;
    setIsScoring(true);
    try {
      const res = await fetch('/api/content/auto-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'score',
          content: contentToScore,
          useCase: contentType,
          platform: channel || undefined,
          title: title || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { composite: number; scores: { name: string; score: number; feedback: string[] }[] };
        setCompositeScore(data.composite);
        setScores(data.scores);
      }
    } catch {
      // Score failure is non-critical
    } finally {
      setIsScoring(false);
    }
  }

  async function handleAutoImprove() {
    if (!content.trim() || !prompt.trim()) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/content/auto-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve',
          content,
          prompt,
          useCase: contentType,
          platform: channel || undefined,
          contentType,
          title: title || undefined,
          maxIterations: 3,
          threshold: 80,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { content: string; compositeScore: number; scores: { name: string; score: number; feedback: string[] }[] };
        setContent(data.content);
        setCompositeScore(data.compositeScore);
        setScores(data.scores);
      }
    } catch {
      // Improve failure is non-critical
    } finally {
      setIsImproving(false);
    }
  }

  async function handleGenerate() {
    if (!prompt) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          contentType,
          channel: channel || undefined,
        }),
      });
      const data = await res.json();

      if (data.content) {
        // Populate the editor with generated content
        setContent(data.content);
        if (data.title) setTitle(data.title);
        // Auto-score the generated content
        handleScore(data.content);
      } else if (data.draftId) {
        // Fallback: redirect to the draft
        router.push(`/dashboard/content/create?draft=${data.draftId}`);
        router.refresh();
      } else if (data.error) {
        setGenerateError(data.error);
      } else {
        // Mock generation when API doesn't return content
        const channelLabel = CHANNELS.find(c => c.value === channel)?.label ?? 'blog';
        const typeLabel = CONTENT_TYPES.find(t => t.value === contentType)?.label ?? 'content';
        const mockTitle = `${prompt.charAt(0).toUpperCase()}${prompt.slice(1, 60)}`;
        const mockContent = `# ${mockTitle}\n\nThis is an AI-generated ${typeLabel.toLowerCase()} for ${channelLabel}.\n\n## Key Points\n\n- ${prompt}\n- Engaging content tailored for your audience\n- Optimized for ${channelLabel}\n\n## Details\n\nYour AI-generated content about "${prompt}" would appear here. Connect your Anthropic API key to generate real content with Claude AI.\n\n## Call to Action\n\nReady to get started? Try our platform free for 15 days.`;
        setTitle(mockTitle);
        setContent(mockContent);
        // Auto-score the mock content
        handleScore(mockContent);
      }
    } catch {
      setGenerateError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!title || !content) return;
    setIsSaving(true);
    try {
      await fetch('/api/content/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          contentType,
          channel: channel || undefined,
        }),
      });
      router.push('/dashboard/content/create');
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl font-display text-foreground">Create Content</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Repeat2 className="size-4 mr-1.5" />
            Repurpose
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Send className="size-4 mr-1.5" />
            Submit for Approval
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !title || !content} data-testid="save-draft-button">
            <Save className="size-4 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main editor area */}
        <div className="space-y-4">
          {/* What are you creating? */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-ui">Creating:</span>
            <Badge variant="outline" className="text-xs">{CONTENT_TYPES.find(t => t.value === contentType)?.label ?? 'Blog Post'}</Badge>
            {channel && <><span>for</span><Badge variant="outline" className="text-xs">{CHANNELS.find(c => c.value === channel)?.label ?? channel}</Badge></>}
          </div>

          {/* AI Generation */}
          <Card className="border-brand-orange/20 bg-brand-orange/5">
            <CardContent className="py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you want to create... e.g., Write a LinkedIn post about selling cotton candy"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && prompt && !isGenerating) handleGenerate(); }}
                  className="flex-1"
                  data-testid="ai-prompt-input"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-brand-void min-w-[120px]"
                  data-testid="generate-button"
                >
                  {isGenerating ? (
                    <><Loader2 className="size-4 mr-1.5 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="size-4 mr-1.5" />Generate</>
                  )}
                </Button>
              </div>
              {generateError && (
                <p className="mt-2 text-sm text-destructive">{generateError}</p>
              )}
              {isGenerating && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin text-brand-orange" />
                  <span>AI is writing your {CONTENT_TYPES.find(t => t.value === contentType)?.label.toLowerCase() ?? 'content'}...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title */}
          <Input
            placeholder="Content title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-heading-lg font-display border-0 px-0 focus-visible:ring-0 bg-transparent"
            data-testid="content-title-input"
          />

          {/* Markdown editor with preview */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label text-muted-foreground">Markdown</span>
                <div className="flex gap-2 text-body-sm text-muted-foreground">
                  <span data-testid="word-count">{wordCount} words</span>
                  <span>·</span>
                  <span data-testid="char-count">{charCount} chars</span>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or generate with AI..."
                className="min-h-[400px] w-full rounded-lg border border-input bg-input/20 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 resize-y"
                data-testid="content-editor"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-label text-muted-foreground mb-2">Preview</span>
              <div
                className="min-h-[400px] rounded-lg border border-border bg-card p-4 text-body-sm text-foreground whitespace-pre-wrap overflow-auto"
                data-testid="content-preview"
              >
                {content ? markdownToPreviewText(content) : (
                  <span className="text-muted-foreground">Preview will appear here...</span>
                )}
              </div>
            </div>
          </div>

          {/* Autoresearch Score Badges */}
          {(scores || isScoring || isImproving) && (
            <div className="flex flex-wrap items-center gap-2" data-testid="autoresearch-scores">
              {isScoring && (
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <Loader2 className="size-3 animate-spin" />
                  Scoring...
                </Badge>
              )}
              {compositeScore !== null && !isScoring && (
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    compositeScore >= 80
                      ? 'border-emerald-500/50 text-emerald-500'
                      : compositeScore >= 60
                        ? 'border-amber-500/50 text-amber-500'
                        : 'border-red-500/50 text-red-500'
                  }`}
                  data-testid="composite-score"
                >
                  <TrendingUp className="size-3 mr-1" />
                  Overall: {compositeScore}/100
                </Badge>
              )}
              {scores && !isScoring && scores.map((s) => (
                <Badge
                  key={s.name}
                  variant="outline"
                  className={`text-xs ${
                    s.score >= 80
                      ? 'border-emerald-500/30 text-emerald-400'
                      : s.score >= 60
                        ? 'border-amber-500/30 text-amber-400'
                        : 'border-red-500/30 text-red-400'
                  }`}
                  data-testid={`score-${s.name}`}
                >
                  {s.name.replace(/_/g, ' ')}: {s.score}
                </Badge>
              ))}
              {content && !isScoring && !isImproving && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAutoImprove}
                  disabled={!prompt.trim()}
                  className="text-xs gap-1.5 border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"
                  data-testid="auto-improve-button"
                >
                  <Zap className="size-3" />
                  Auto-Improve
                </Button>
              )}
              {isImproving && (
                <Badge variant="outline" className="gap-1.5 text-xs text-brand-orange border-brand-orange/30">
                  <Loader2 className="size-3 animate-spin" />
                  Improving...
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-ui">Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger data-testid="content-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-ui">Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger data-testid="channel-select">
                  <SelectValue placeholder="Select channel..." />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-ui">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Draft</Badge>
            </CardContent>
          </Card>

          {wordCount > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-ui">Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-muted-foreground space-y-1">
                <p>{wordCount} words</p>
                <p>{charCount} characters</p>
                <p>~{Math.ceil(wordCount / 200)} min read</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
