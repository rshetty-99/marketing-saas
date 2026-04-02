'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plug, Unplug, Mail, Search, BarChart3, MessageSquare, Zap } from 'lucide-react';

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
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'twitter', name: 'Twitter / X', color: '#1DA1F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'pinterest', name: 'Pinterest', color: '#BD081C' },
  { id: 'google_business', name: 'Google Business', color: '#4285F4' },
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

  async function handleConnect(platform: string) {
    setIsConnecting(platform);
    try {
      await fetch('/api/social/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      window.location.reload();
    } catch {
      // handle error
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
            Connect your social accounts, tools, and services.
          </p>
        </div>
      </div>

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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting === platform.id}
                      data-testid={`connect-${platform.id}`}
                    >
                      <Plug className="size-3.5 mr-1.5" />
                      {isConnecting === platform.id ? 'Connecting...' : 'Connect'}
                    </Button>
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
