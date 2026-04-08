'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plug, Unplug, Mail, Search, BarChart3, MessageSquare, Zap, ExternalLink, Loader2, Info } from 'lucide-react';

interface Connection {
  id: string;
  platform: string;
  platformUsername: string;
  platformDisplayName: string;
  accountType: string;
  status: string;
  healthStatus: string;
  followerCount: number;
  avgEngagementRate: number;
}

interface IntegrationsClientProps {
  connections: Connection[];
}

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', desc: 'Publish posts, articles, and track engagement on your LinkedIn profile or company page.' },
  { id: 'twitter', name: 'Twitter / X', color: '#1DA1F2', desc: 'Post tweets, threads, and monitor mentions and engagement metrics.' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', desc: 'Schedule and publish posts, reels, and stories. Requires a Business or Creator account.' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', desc: 'Manage page posts, track reach, and engage with your audience.' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', desc: 'Upload videos and track views, likes, and follower growth.' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', desc: 'Upload videos, manage descriptions, and track channel analytics.' },
  { id: 'pinterest', name: 'Pinterest', color: '#BD081C', desc: 'Pin content to boards and track impressions and saves.' },
  { id: 'google_business', name: 'Google Business', color: '#4285F4', desc: 'Post updates, respond to reviews, and manage your business listing.' },
];

const COMING_SOON_CATEGORIES = [
  { name: 'Email Platforms', icon: Mail, items: ['Mailchimp', 'SendGrid', 'Resend'] },
  { name: 'SEO Tools', icon: Search, items: ['SEMrush', 'Ahrefs', 'Google Search Console'] },
  { name: 'Analytics', icon: BarChart3, items: ['Google Analytics', 'Mixpanel'] },
  { name: 'Collaboration', icon: MessageSquare, items: ['Slack', 'Zapier', 'Make'] },
];

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  expired: 'bg-red-500',
};

export function IntegrationsClient({ connections }: IntegrationsClientProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function handleConnect(platform: string) {
    setIsConnecting(platform);
    setConnectError(null);
    try {
      // Step 1: Get the OAuth authorization URL from our API
      const res = await fetch(`/api/social/auth/${platform}`);
      const data = await res.json();

      if (data.authUrl) {
        // Step 2: Redirect to the platform's OAuth page
        // The platform will ask the user to authorize Aura
        // After authorization, the platform redirects back to our callback URL
        window.location.href = data.authUrl;
        return; // Don't reset isConnecting — we're navigating away
      }

      if (data.error) {
        // OAuth not configured for this platform — create mock connection for dev
        setConnectError(data.error);
        // Fallback: create a mock connection so the user can explore the UI
        await fetch('/api/social/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        });
        window.location.reload();
        return;
      }
    } catch {
      setConnectError('Failed to connect. Please try again.');
    } finally {
      setIsConnecting(null);
    }
  }

  async function handleDisconnect(connectionId: string) {
    await fetch(`/api/social/connections/${connectionId}`, { method: 'DELETE' });
    window.location.reload();
  }

  const connectedPlatforms = new Set(connections.map((c) => c.platform));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-xl font-display text-foreground">Integrations</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Connect your social accounts to publish content, track analytics, and manage engagement — all from one dashboard.
          </p>
        </div>
      </div>

      {/* How it works */}
      <Card className="border-brand-orange/20 bg-brand-orange/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-brand-orange shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-ui font-medium text-foreground mb-1">How connecting works</p>
              <p className="text-muted-foreground">Click <strong>Connect</strong> on any platform below. You&apos;ll be redirected to the platform&apos;s authorization page to grant Aura permission to publish and read analytics on your behalf. Your credentials are encrypted and never stored as plain text.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {connectError && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">{connectError}</p>
            <p className="text-xs text-muted-foreground mt-1">A demo connection was created so you can explore the platform. For real publishing, configure OAuth credentials in your environment.</p>
          </CardContent>
        </Card>
      )}

      {/* Social Media Connections (F9) */}
      <div>
        <h2 className="text-heading-md font-display text-foreground mb-4" data-testid="social-category">
          <Zap className="inline size-5 mr-2 text-brand-orange" />
          Social Media
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="social-platforms-grid">
          {SOCIAL_PLATFORMS.map((platform) => {
            const connection = connections.find((c) => c.platform === platform.id);
            const isConnected = !!connection;

            return (
              <Card key={platform.id} data-testid={`platform-${platform.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-ui text-sm font-medium">{platform.name}</p>
                      {isConnected && (
                        <p className="text-[11px] text-muted-foreground">{connection.platformUsername}</p>
                      )}
                    </div>
                    {isConnected && (
                      <div className={`size-2.5 rounded-full ${HEALTH_COLORS[connection.healthStatus] ?? 'bg-muted'}`} />
                    )}
                  </div>

                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{connection.followerCount.toLocaleString()} followers</span>
                        <span>{(connection.avgEngagementRate * 100).toFixed(1)}% eng.</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">{connection.accountType}</Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${connection.healthStatus === 'healthy' ? 'text-green-500 border-green-500/30' : 'text-yellow-500 border-yellow-500/30'}`}
                          data-testid={`status-${platform.id}`}
                        >
                          {connection.healthStatus}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        <Unplug className="size-3.5 mr-1.5" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{platform.desc}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting === platform.id}
                        data-testid={`connect-${platform.id}`}
                      >
                        {isConnecting === platform.id ? (
                          <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Connecting...</>
                        ) : (
                          <><ExternalLink className="size-3.5 mr-1.5" />Connect {platform.name}</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Categories */}
      {COMING_SOON_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.name}>
            <h2 className="text-heading-md font-display text-foreground mb-4 opacity-50">
              <Icon className="inline size-5 mr-2" />
              {category.name}
              <Badge variant="outline" className="ml-2 text-[10px]">Coming Soon</Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 opacity-40">
              {category.items.map((item) => (
                <Card key={item}>
                  <CardContent className="py-4 text-center">
                    <p className="font-ui text-sm text-muted-foreground">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
